import { useState } from 'react'
import {
  Home, Shield, Users, Search, BarChart3, ArrowLeftRight, Flame,
  ChevronDown, Bell, Settings,
} from 'lucide-react'
import LeagueHome from './pages/LeagueHome.jsx'
import LiveScoring from './pages/LiveScoring.jsx'
import MyFranchise from './pages/MyFranchise.jsx'

const PAGES = [
  { id: 'home', component: LeagueHome },
  { id: 'scoring', component: LiveScoring },
  { id: 'franchise', component: MyFranchise },
]

// Shared top nav shown above Live Scoring and My Franchise. Visually mirrors
// LeagueHome's own Chrome component so every page reads as the same app.
// LeagueHome continues to render its built-in Chrome, so this component is
// deliberately hidden on that page to avoid stacked headers.
function AppHeader({ activeId, onNavigate }) {
  const colors = {
    primary: '#1a4d3e',
    accent: '#c8a24b',
    text: '#22201c',
    textMuted: '#7a7468',
    bgCard: '#ffffff',
    border: '#e8e2d3',
    primarySoft: '#e8f0eb',
    danger: '#b84848',
  }

  const navItems = [
    { label: 'Home',    icon: Home,           pageId: 'home' },
    { label: 'My Franchise', icon: Shield,    pageId: 'franchise' },
    { label: 'League',  icon: Users,          pageId: null },
    { label: 'Players', icon: Search,         pageId: null },
    { label: 'Scores',  icon: BarChart3,      pageId: 'scoring' },
    { label: 'Trades',  icon: ArrowLeftRight, pageId: null },
    { label: 'Draft',   icon: Flame,          pageId: null },
  ]

  return (
    <div
      className="sticky top-0 z-40"
      style={{
        background: colors.bgCard,
        borderBottom: `1px solid ${colors.border}`,
        fontFamily: '"Archivo", system-ui, sans-serif',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Left: Logo + League picker */}
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center font-black text-lg"
              style={{
                background: colors.primary,
                color: colors.accent,
                fontFamily: '"Fraunces", serif',
                letterSpacing: '-0.04em',
              }}
            >
              L<span style={{ fontSize: '0.7em', verticalAlign: 'super', marginLeft: '-1px' }}>™</span>
            </div>
            <span
              className="font-semibold text-[15px] tracking-tight hidden sm:inline"
              style={{ color: colors.text, fontFamily: '"Fraunces", serif' }}
            >
              LMP
            </span>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-black/5 min-w-0"
            style={{ color: colors.text }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs"
              style={{ background: colors.primary, color: colors.accent, fontFamily: '"Fraunces", serif' }}
            >
              L
            </div>
            <span className="truncate">The Empire League</span>
            <ChevronDown size={14} style={{ color: colors.textMuted }} />
          </button>
        </div>

        {/* Center: Main nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = item.pageId != null && activeId === item.pageId
            const clickable = item.pageId != null
            return (
              <button
                key={item.label}
                onClick={() => clickable && onNavigate(item.pageId)}
                disabled={!clickable}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all"
                style={{
                  color: isActive ? colors.primary : colors.textMuted,
                  background: isActive ? colors.primarySoft : 'transparent',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: clickable ? 1 : 0.55,
                }}
                onMouseEnter={e => { if (!isActive && clickable) e.currentTarget.style.color = colors.text }}
                onMouseLeave={e => { if (!isActive && clickable) e.currentTarget.style.color = colors.textMuted }}
              >
                <Icon size={15} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-md flex items-center justify-center transition-colors hover:bg-black/5 relative"
            style={{ color: colors.textMuted }}
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: colors.danger }} />
          </button>
          <button
            className="w-9 h-9 rounded-md flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: colors.textMuted }}
          >
            <Settings size={17} />
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ml-1"
            style={{ background: colors.primary, color: colors.accent, fontFamily: '"Fraunces", serif' }}
          >
            CP
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const active = PAGES.find(p => p.id === activeId) ?? PAGES[0]
  const ActiveComponent = active.component

  return (
    <div className="lmp-shell">
      {activeId !== 'home' && <AppHeader activeId={activeId} onNavigate={setActiveId} />}
      <main className="lmp-main">
        <ActiveComponent onNavigate={setActiveId} />
      </main>
    </div>
  )
}
