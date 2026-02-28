import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function Auth({ user }) {
  const router = useRouter()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (user) router.push('/app')
  }, [user])

  useEffect(() => {
    if (router.query.mode === 'signup') setMode('signup')
  }, [router.query.mode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created — check your email to confirm, then sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/app')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'signup' ? 'Create Account' : 'Sign In'

  return (
    <>
      <Head><title>GroundLevel — {title}</title></Head>

      <div style={outer}>
        <div style={box}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <strong style={{ letterSpacing: '0.1em', fontSize: '0.85rem' }}>GROUNDLEVEL</strong>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', letterSpacing: '0.05em' }}>
              {mode === 'signup' ? 'CREATE YOUR ACCOUNT' : 'SIGN IN TO YOUR ACCOUNT'}
            </div>
          </div>

          {success ? (
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', padding: '20px', textAlign: 'center', color: '#4ade80', fontSize: '0.85rem', lineHeight: 1.7 }}>
              {success}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>EMAIL</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email" style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>PASSWORD</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  style={inputStyle}
                />
              </div>

              <button type="submit" disabled={loading} style={submitBtn(loading)}>
                {loading ? '...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
            {mode === 'signup' ? (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(null); }} style={linkBtn}> Sign in</button>
              </>
            ) : (
              <>No account?{' '}
                <button onClick={() => { setMode('signup'); setError(null); }} style={linkBtn}> Sign up free</button>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
            <button onClick={() => router.push('/app')} style={{ ...linkBtn, color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem' }}>
              Continue without account →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const outer = {
  background: '#0a0a0f', minHeight: '100vh',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Courier New', monospace", color: 'white', padding: 20,
}
const box = { width: '100%', maxWidth: 380, padding: '40px 36px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }
const labelStyle = { display: 'block', fontSize: '0.66rem', color: 'rgba(255,255,255,0.35)', marginBottom: 7, letterSpacing: '0.1em' }
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }
const submitBtn = (loading) => ({ width: '100%', background: loading ? '#2d8a55' : '#4ade80', color: '#0a0a0f', border: 'none', padding: '12px', fontFamily: 'inherit', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', fontSize: '0.82rem' })
const linkBtn = { background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontSize: 'inherit' }
