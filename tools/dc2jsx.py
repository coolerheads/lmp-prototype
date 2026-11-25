"""Convert a Claude Design .dc.html board into a React component (JSX + CSS).

Usage: python3 dc2jsx.py board.dc.html ComponentName out_dir [--scope cls]
Produces out_dir/ComponentName.jsx and out_dir/ComponentName.css.
Holes {{a.b}} -> {v.a.b} (or loop var), <sc-if> -> {cond && <>..</>}, <sc-for> -> {list.map(..)}.
renderVals() is kept verbatim and run with a small this-shim (props/state/setState).
"""
import re, sys, json, html
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
ATTR = {'class':'className','for':'htmlFor','tabindex':'tabIndex','readonly':'readOnly','maxlength':'maxLength',
        'stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin',
        'fill-rule':'fillRule','clip-rule':'clipRule','viewbox':'viewBox','stroke-dasharray':'strokeDasharray',
        'onclick':'onClick','oninput':'onChange','onchange':'onChange','colspan':'colSpan','rowspan':'rowSpan',
        'stop-color':'stopColor','stop-opacity':'stopOpacity','font-size':'fontSize','font-weight':'fontWeight',
        'text-anchor':'textAnchor','dominant-baseline':'dominantBaseline','gradientunits':'gradientUnits',
        'preserveaspectratio':'preserveAspectRatio','stroke-opacity':'strokeOpacity','fill-opacity':'fillOpacity',
        'stroke-miterlimit':'strokeMiterlimit','xlink:href':'xlinkHref','autocomplete':'autoComplete','spellcheck':'spellCheck'}
SVG_CASE = {'viewbox':'viewBox','lineargradient':'linearGradient','radialgradient':'radialGradient','clippath':'clipPath',
            'foreignobject':'foreignObject','textpath':'textPath','fegaussianblur':'feGaussianBlur'}
HOLE = re.compile(r'\{\{\s*([^}]*?)\s*\}\}')

class Conv(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []; self.loops = []; self.stack = []
    def expr(self, e):
        e = e.strip()
        root = re.split(r'[.\[]', e)[0]
        if root in self.loops or re.match(r'^(true|false|null|\d)', e):
            return e
        return 'v.' + e
    def text_with_holes(self, t):
        parts = []; last = 0
        for m in HOLE.finditer(t):
            if m.start() > last: parts.append(self.esc(t[last:m.start()]))
            parts.append('{' + self.expr(m.group(1)) + '}')
            last = m.end()
        if last < len(t): parts.append(self.esc(t[last:]))
        return ''.join(parts)
    def esc(self, s):
        return s.replace('{', '{"{"}').replace('}', '{"}"}')
    def attr_val(self, name, val):
        if val is None: return '{true}'
        m = HOLE.fullmatch(val.strip())
        if m: return '{' + self.expr(m.group(1)) + '}'
        if HOLE.search(val):
            tpl = HOLE.sub(lambda mm: '${' + self.expr(mm.group(1)) + '}', html.unescape(val).replace('`', '\\`'))
            return '{`' + tpl + '`}'
        return json.dumps(html.unescape(val))
    def style_val(self, val):
        decls = [d for d in re.split(r';(?![^(]*\))', html.unescape(val)) if d.strip()]
        items = []
        for d in decls:
            k, _, w = d.partition(':')
            k = k.strip(); w = w.strip()
            if k.startswith('--'): key = json.dumps(k)
            else: key = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
            if HOLE.search(w):
                m = HOLE.fullmatch(w)
                vv = self.expr(m.group(1)) if m else '`' + HOLE.sub(lambda mm: '${' + self.expr(mm.group(1)) + '}', w) + '`'
            else: vv = json.dumps(w)
            items.append(f'{key}: {vv}')
        return '{{' + ', '.join(items) + '}}'
    def handle_starttag(self, tag, attrs):
        self._open(tag, attrs, False)
    def handle_startendtag(self, tag, attrs):
        self._open(tag, attrs, True)
    def _open(self, tag, attrs, selfclose):
        a = dict(attrs)
        if tag == 'sc-if':
            m = HOLE.fullmatch(a['value'].strip()); cond = self.expr(m.group(1))
            self.out.append('{(' + cond + ') && (<>'); self.stack.append('sc-if'); return
        if tag == 'sc-for':
            m = HOLE.fullmatch(a['list'].strip()); lst = self.expr(m.group(1)); var = a.get('as', 'item')
            self.loops.append(var)
            self.out.append('{(' + lst + ' || []).map((' + var + ', ' + var + '_i) => (<React.Fragment key={' + var + '_i}>')
            self.stack.append('sc-for'); return
        t = SVG_CASE.get(tag, tag)
        parts = []
        for k, val in attrs:
            if k.startswith('hint-'): continue
            name = ATTR.get(k, k)
            if k == 'style': parts.append('style=' + self.style_val(val)); continue
            parts.append(name + '=' + self.attr_val(k, val))
        s = '<' + t + (' ' + ' '.join(parts) if parts else '')
        if selfclose or tag in VOID: self.out.append(s + ' />')
        else: self.out.append(s + '>'); self.stack.append(t)
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack: return
        t = self.stack.pop()
        if t == 'sc-if': self.out.append('</>)}')
        elif t == 'sc-for': self.loops.pop(); self.out.append('</React.Fragment>))}')
        else: self.out.append('</' + t + '>')
    def handle_data(self, d):
        self.out.append(self.text_with_holes(d))
    def handle_entityref(self, n): self.out.append('&' + n + ';')
    def handle_charref(self, n): self.out.append('&#' + n + ';')

def convert(src, name, scope=None):
    s = open(src).read()
    css = re.search(r'<style>(.*?)</style>', s, re.S).group(1)
    fonts = re.findall(r'<link rel="stylesheet" href="([^"]+)"', s)
    body = re.search(r'</helmet>(.*)</x-dc>', s, re.S).group(1).strip()
    m = re.search(r'data-props=(["\'])(.*?)\1>(.*?)</script>', s, re.S)
    props = json.loads(html.unescape(m.group(2))); js = m.group(3)
    rv = re.search(r'renderVals\(\)\s*\{(.*)\}\s*\}\s*$', js.strip(), re.S).group(1)
    c = Conv(); c.feed(body); c.close()
    jsx = ''.join(c.out)
    defaults = {k: v.get('default') for k, v in props.items() if not k.startswith('$')}
    comp = f'''/* Generated from Claude Design board {src.split('/')[-1]} by dc2jsx.py — edit freely. */
import React, {{ useState }} from 'react'
import './{name}.css'

export const {name}Defaults = {json.dumps(defaults)}

function renderVals() {{{rv}}}

export default function {name}(props) {{
  const [state, setStateRaw] = useState({{}})
  const shim = {{
    props: {{ ...{name}Defaults, ...props }},
    state,
    setState: (o) => setStateRaw((s) => ({{ ...s, ...o }})),
  }}
  const v = renderVals.call(shim)
  return (
    <>{jsx}</>
  )
}}
'''
    return comp, css, fonts

if __name__ == '__main__':
    src, name, out = sys.argv[1:4]
    comp, css, fonts = convert(src, name)
    open(f'{out}/{name}.jsx', 'w').write(comp)
    open(f'{out}/{name}.css', 'w').write(css)
    print(name, len(comp), len(css), fonts)

def scope_css(css, scope):
    out = []; i = 0; n = len(css)
    def prefix(sel):
        res = []
        for p in sel.split(','):
            p = p.strip()
            if not p: continue
            if p in ('body', 'html', ':root'): res.append(scope); continue
            res.append(scope + ' ' + p)
        return ','.join(res)
    while i < n:
        j = css.find('{', i)
        if j < 0: out.append(css[i:]); break
        sel = css[i:j].strip()
        if sel.startswith('@media') or sel.startswith('@supports'):
            depth = 1; k = j + 1
            while depth and k < n:
                if css[k] == '{': depth += 1
                elif css[k] == '}': depth -= 1
                k += 1
            out.append(sel + '{' + scope_css(css[j+1:k-1], scope) + '}'); i = k; continue
        if sel.startswith('@'):
            depth = 1; k = j + 1
            while depth and k < n:
                if css[k] == '{': depth += 1
                elif css[k] == '}': depth -= 1
                k += 1
            out.append(css[i:k]); i = k; continue
        k = css.find('}', j)
        out.append(prefix(sel) + '{' + css[j+1:k] + '}\n'); i = k + 1
    return ''.join(out)
