import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Home({ user }) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>GroundLevel — Know Your Rights</title>
        <meta name="description" content="Record encounters. Detect bluffs. Analyse against actual UK law. File complaints in one click." />
      </Head>

      <div style={{ background: '#0a0a0f', minHeight: '100vh', color: 'white', fontFamily: "'Courier New', monospace" }}>
        {/* Nav */}
        <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
            <strong style={{ letterSpacing: '0.1em', fontSize: '0.95rem' }}>GROUNDLEVEL</strong>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {user ? (
              <button onClick={() => router.push('/app')} style={btnGreen}>
                OPEN APP →
              </button>
            ) : (
              <>
                <button onClick={() => router.push('/auth')} style={btnGhost}>SIGN IN</button>
                <button onClick={() => router.push('/auth?mode=signup')} style={btnGreen}>GET STARTED →</button>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 40px 80px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', padding: '6px 16px', marginBottom: 36, fontSize: '0.72rem', letterSpacing: '0.1em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            UK LAW · AI ANALYSIS · REAL RIGHTS
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Record. Analyse. Challenge.
            <br />
            <span style={{ color: '#4ade80' }}>Know your rights.</span>
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 48, maxWidth: 520, margin: '0 auto 48px' }}>
            GroundLevel analyses encounters with police, security and enforcement against actual UK law.
            AI-powered. Evidence-grade. One tap to file a formal complaint.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/auth?mode=signup')} style={{ ...btnGreen, padding: '14px 32px', fontSize: '0.9rem' }}>
              START FREE
            </button>
            <button onClick={() => router.push('/app')} style={{ ...btnGhost, padding: '14px 32px', fontSize: '0.9rem' }}>
              TRY THE APP
            </button>
          </div>
        </div>

        {/* Features */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { icon: '⏺', title: 'Record Encounters', desc: 'Timestamp, badge number, location. Built-in timer for audio notes.' },
            { icon: '⚡', title: 'Bluff Detector', desc: '10+ common enforcement bluffs pre-loaded. Instant verdict.' },
            { icon: '🔍', title: 'AI Legal Analysis', desc: 'Analysed against PACE 1984, HRA 1998, Police Reform Act 2002.' },
            { icon: '📋', title: 'File Complaints', desc: 'Formal letters to IOPC, SIA, LGO — generated in seconds.' },
          ].map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 8, letterSpacing: '0.04em', fontSize: '0.85rem' }}>{f.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 40px 80px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 40, fontWeight: 400, letterSpacing: '0.05em', fontSize: '1.1rem' }}>SIMPLE PRICING</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left' }}>
            {[
              { plan: 'Free', price: '£0', features: ['Record encounters', 'Know your rights', 'Bluff detector', '5 AI analyses/month'] },
              { plan: 'Pro', price: '£9/mo', features: ['Everything in Free', 'Unlimited AI analyses', 'Complaint letters', 'Pattern database', 'Full encounter history'], highlight: true },
            ].map(p => (
              <div key={p.plan} style={{ background: p.highlight ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${p.highlight ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.06)'}`, padding: '28px 24px' }}>
                <div style={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.7rem', color: p.highlight ? '#4ade80' : 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{p.plan.toUpperCase()}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 400, marginBottom: 20 }}>{p.price}</div>
                {p.features.map(f => (
                  <div key={f} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', padding: '4px 0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
                <button onClick={() => router.push(p.highlight ? '/auth?mode=signup' : '/app')} style={{ ...p.highlight ? btnGreen : btnGhost, marginTop: 20, width: '100%', padding: '10px', fontSize: '0.75rem' }}>
                  {p.highlight ? 'GET PRO' : 'START FREE'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <footer style={{ padding: '32px 40px', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          GroundLevel · Not legal advice · Know your rights
        </footer>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  )
}

const btnGreen = {
  background: '#4ade80', color: '#0a0a0f', border: 'none',
  padding: '9px 20px', cursor: 'pointer', fontFamily: 'inherit',
  fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em',
}
const btnGhost = {
  background: 'transparent', color: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(255,255,255,0.12)', padding: '9px 16px',
  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
}
