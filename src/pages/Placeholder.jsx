import React from 'react'

const TITLES = {
  standings: 'Standings', players: 'Players', trades: 'Trades', clubhouse: 'Clubhouse', gameplan: 'Game Plan',
  wire: 'The Wire', gameday: 'Game Day', more: 'More',
}

export default function Placeholder({ route, dark }) {
  return (
    <div className={'ph ' + (dark ? 'dk' : 'lt')}>
      <div className="ph-eb">The Empire League · Week 7</div>
      <h1 className="ph-h1">{TITLES[route] || route}</h1>
      <div className="ph-card">
        <b>Next in the rebuild.</b> This page moves to the new system after Live Scoring, Home and My Franchise.
        Until then, the previous version is still live at <a href="https://lmp-prototype.vercel.app" target="_blank" rel="noreferrer">lmp-prototype.vercel.app</a>.
      </div>
    </div>
  )
}
