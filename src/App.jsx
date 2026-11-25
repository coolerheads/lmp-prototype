import React, { useEffect, useState } from 'react'
import { ShellBoard } from './boards/Shell.jsx'
import { LiveScoringBoard, FranchiseBoard } from './boards/Restrained.jsx'
import DemoPanel, { DEMO_DEFAULTS } from './DemoPanel.jsx'
import Gate from './Gate.jsx'
import Placeholder from './pages/Placeholder.jsx'

const ROUTES = ['home', 'franchise', 'scores', 'standings', 'players', 'trades', 'clubhouse', 'gameplan', 'wire', 'gameday', 'more']

function readRoute() {
  const r = (window.location.hash || '').replace(/^#\/?/, '').split(/[?/]/)[0]
  return ROUTES.includes(r) ? r : 'home'
}

function load() {
  try { return { ...DEMO_DEFAULTS, ...JSON.parse(localStorage.getItem('lmp-demo') || '{}') } } catch { return { ...DEMO_DEFAULTS } }
}

const HERO_BTN = {
  'Before lineup lock': ['Set lineup · 2 yet to lock', '#/franchise'],
  'Games live': ['Live scoring', '#/scores'],
  'Week complete': ['Week 7 recap', '#/clubhouse'],
}

export default function App() {
  const [route, setRoute] = useState(readRoute)
  const [demo, setDemo] = useState(load)
  const [fly, setFly] = useState(false)

  useEffect(() => {
    const on = () => { setRoute(readRoute()); setFly(false); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => { try { localStorage.setItem('lmp-demo', JSON.stringify(demo)) } catch { /* private mode */ } }, [demo])
  useEffect(() => { document.body.style.background = demo.theme === 'Dark' ? '#0E1015' : '#F3F4F6' }, [demo.theme])

  const dark = demo.theme === 'Dark'
  const board = {
    dark, flexTag: demo.flexTag, type: 'Saira', header: demo.header, badge: demo.badge,
    stdAccent: demo.stdAccent, sides: demo.sides, teamTiles: false,
  }
  const [heroBtn, heroHref] = HERO_BTN[demo.weekState] || HERO_BTN['Before lineup lock']

  let page = null
  if (route === 'scores') page = <LiveScoringBoard {...board} />
  else if (route === 'franchise') page = <FranchiseBoard {...board} />
  else if (route !== 'home') page = <Placeholder route={route} dark={dark} />

  return (
    <Gate>
      <ShellBoard
        route={route}
        dark={dark}
        easyButtons={demo.easyButtons}
        leagueBar={demo.leagueBar}
        hero={demo.header === 'Premium' ? 'Premium' : 'Standard'}
        leaguesFlyout={fly}
        onToggleFly={(e) => { if (e) e.preventDefault(); setFly((f) => !f) }}
        heroBtn={heroBtn}
        heroHref={heroHref}
      >
        {page}
      </ShellBoard>
      <DemoPanel demo={demo} setDemo={setDemo} />
    </Gate>
  )
}
