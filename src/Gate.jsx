import React, { useState } from 'react'

const CODE = 'empire2027'

function ok() { try { return sessionStorage.getItem('lmp-gate') === '1' } catch { return false } }

export default function Gate({ children }) {
  const [pass, setPass] = useState(ok)
  const [val, setVal] = useState('')
  const [err, setErr] = useState(false)
  if (pass) return children
  const submit = (e) => {
    e.preventDefault()
    if (val.trim().toLowerCase() === CODE) { try { sessionStorage.setItem('lmp-gate', '1') } catch { /* ignore */ } setPass(true) }
    else setErr(true)
  }
  return (
    <form className="gate" onSubmit={submit}>
      <div className="gate-card">
        <div className="gate-logo">fan<i>ball</i></div>
        <p>Prototype preview. Enter the passcode to continue.</p>
        <input type="password" value={val} onChange={(e) => { setVal(e.target.value); setErr(false) }} placeholder="Passcode" autoFocus aria-label="Passcode" />
        {err && <small>That passcode didn't work.</small>}
        <button type="submit">Enter</button>
      </div>
    </form>
  )
}
