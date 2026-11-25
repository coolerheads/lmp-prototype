import React, { useState } from 'react'

export const DEMO_OPTIONS = {
  theme: ['Light', 'Dark'],
  easyButtons: ['Rail league section', 'Top tabs only'],
  leagueBar: ['League color', 'Brand ink', 'Follow theme', 'White'],
  header: ['Standard', 'Premium', 'Mixed (SYN premium)'],
  sides: ['Syndicate left', 'Syndicate right'],
  badge: ['Custom', 'Default'],
  stdAccent: ['Badge + top edge', 'Badge only'],
  flexTag: ['letters', 'split', 'dots', 'underline'],
  weekState: ['Before lineup lock', 'Games live', 'Week complete'],
}

export const DEMO_DEFAULTS = Object.fromEntries(Object.entries(DEMO_OPTIONS).map(([k, v]) => [k, v[0]]))

const LABELS = {
  theme: 'Theme', easyButtons: 'Easy buttons', leagueBar: 'League bar', header: 'Matchup header',
  sides: 'Sides', badge: 'Team badge', stdAccent: 'Standard accent', flexTag: 'Flex tag style', weekState: 'Week state (Home)',
}

export default function DemoPanel({ demo, setDemo }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="demo">
      {open && (
        <div className="demo-panel" role="dialog" aria-label="Demo settings">
          <div className="demo-h"><b>Demo</b><button type="button" onClick={() => setDemo({ ...DEMO_DEFAULTS })}>Reset</button></div>
          {Object.entries(DEMO_OPTIONS).map(([k, opts]) => (
            <label key={k} className="demo-row">
              <span>{LABELS[k]}</span>
              <select value={demo[k]} onChange={(e) => setDemo({ ...demo, [k]: e.target.value })}>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}
      <button type="button" className="demo-btn" onClick={() => setOpen(!open)} aria-expanded={open}>Demo</button>
    </div>
  )
}
