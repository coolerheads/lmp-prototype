import { useState } from 'react'
import LeagueHome from './pages/LeagueHome.jsx'
import LiveScoring from './pages/LiveScoring.jsx'
import MyFranchise from './pages/MyFranchise.jsx'

const PAGES = [
  { id: 'home', label: 'League Home', component: LeagueHome },
  { id: 'scoring', label: 'Live Scoring', component: LiveScoring },
  { id: 'franchise', label: 'My Franchise', component: MyFranchise },
]

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const active = PAGES.find((p) => p.id === activeId) ?? PAGES[0]
  const ActiveComponent = active.component

  return (
    <div className="lmp-shell">
      <nav className="lmp-nav">
        <div className="lmp-nav-brand">LMP Prototype</div>
        <div className="lmp-nav-tabs">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={`lmp-nav-tab${p.id === activeId ? ' is-active' : ''}`}
              onClick={() => setActiveId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="lmp-main">
        <ActiveComponent />
      </main>
    </div>
  )
}
