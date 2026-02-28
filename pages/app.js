import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { ENCOUNTER_TYPES, UK_RIGHTS, BLUFF_PHRASES, FLAG_LEVELS } from '../lib/uklaw'

const TABS = [
  { id: 'record', label: 'RECORD', icon: '⏺' },
  { id: 'rights', label: 'RIGHTS', icon: '📖' },
  { id: 'bluff', label: 'BLUFF', icon: '⚡' },
  { id: 'history', label: 'HISTORY', icon: '📋' },
]

export default function App({ user, loading }) {
  const router = useRouter()
  const [tab, setTab] = useState('rights')
  const [profile, setProfile] = useState(null)
  const [encounters, setEncounters] = useState([])

  // Record tab
  const [encType, setEncType] = useState('stop_search')
  const [badge, setBadge] = useState('')
  const [desc, setDesc] = useState('')
  const [locNote, setLocNote] = useState('')
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recordStart = useRef(null)
  const [saving, setSaving] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [recordMsg, setRecordMsg] = useState(null)

  // Rights tab
  const [rightsType, setRightsType] = useState('stop_search')
  const [showScript, setShowScript] = useState(false)

  // Bluff tab
  const [bluffInput, setBluffInput] = useState('')
  const [bluffResult, setBluffResult] = useState(null)

  // History tab
  const [selectedEnc, setSelectedEnc] = useState(null)
  const [complaint, setComplaint] = useState(null)
  const [genComplaint, setGenComplaint] = useState(false)

  useEffect(() => {
    if (user) {
      fetch(`/api/profile?user_id=${user.id}`)
        .then(r => r.json())
        .then(d => { setProfile(d.profile); setEncounters(d.encounters || []) })
        .catch(() => {})
    }
  }, [user])

  // Recording timer
  useEffect(() => {
    if (!recording) return
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - recordStart.current) / 1000)), 500)
    return () => clearInterval(iv)
  }, [recording])

  const startRec = () => { recordStart.current = Date.now(); setElapsed(0); setRecording(true) }
  const stopRec = () => setRecording(false)
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const analyseEncounter = async () => {
    if (!desc.trim()) return
    setAnalysing(true); setAnalysis(null)
    try {
      const r = await fetch('/api/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, badge_number: badge, encounter_type: encType, user_id: user?.id }),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data)
      if (data.encounter_id) {
        setEncounters(prev => [{ id: data.encounter_id, description: desc, badge_number: badge, encounter_type: encType, created_at: new Date().toISOString(), flag: data.flag, summary: data.summary, complaint_worthy: data.complaint_worthy, complaint_body: data.complaint_body }, ...prev])
      }
    } catch (err) { setRecordMsg({ type: 'error', text: 'Analysis failed: ' + err.message }) }
    finally { setAnalysing(false) }
  }

  const saveEncounter = async () => {
    if (!desc.trim() || !user) { setRecordMsg({ type: 'error', text: 'Sign in to save encounters.' }); return }
    setSaving(true)
    try {
      const r = await fetch('/api/save-encounter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, encounter_type: encType, badge_number: badge, description: desc, location_note: locNote, recording_duration: elapsed }),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setEncounters(prev => [data, ...prev])
      setDesc(''); setBadge(''); setLocNote(''); setElapsed(0); setRecording(false); setAnalysis(null)
      setRecordMsg({ type: 'success', text: 'Encounter saved.' })
      setTimeout(() => setTab('history'), 1200)
    } catch (err) { setRecordMsg({ type: 'error', text: err.message }) }
    finally { setSaving(false) }
  }

  const checkBluff = () => {
    if (!bluffInput.trim()) return
    const input = bluffInput.toLowerCase()
    const match = BLUFF_PHRASES.find(p => input.includes(p.phrase.toLowerCase()))
    setBluffResult(match || { phrase: bluffInput, verdict: 'NOT IN DATABASE', detail: 'This phrase isn\'t in our database. Assess using your rights knowledge below.', risk: 'unknown' })
  }

  const generateComplaint = async (enc) => {
    if (profile?.plan !== 'pro') { alert('Complaint letters require Pro. Upgrade at groundlevel.app'); return }
    setGenComplaint(true); setComplaint(null)
    try {
      const r = await fetch('/api/complaint', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_description: enc.description, complaint_body: enc.complaint_body || 'IOPC', badge_number: enc.badge_number, encounter_type: enc.encounter_type }),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setComplaint(data.letter)
    } catch (err) { alert('Failed: ' + err.message) }
    finally { setGenComplaint(false) }
  }

  const handleUpgrade = async () => {
    if (!user) { router.push('/auth?mode=signup'); return }
    const r = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, email: user.email }),
    })
    const { url } = await r.json()
    if (url) window.location.href = url
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/') }

  if (loading) return <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'monospace', letterSpacing: '0.05em' }}>Loading...</div>

  const rights = UK_RIGHTS[rightsType]
  const flagInfo = analysis ? FLAG_LEVELS[analysis.flag] : null
  const isPro = profile?.plan === 'pro'

  return (
    <>
      <Head><title>GroundLevel App</title></Head>

      <div style={{ background: '#0a0a0f', minHeight: '100vh', color: 'white', fontFamily: "'Courier New', monospace", fontSize: 13 }}>

        {/* Nav */}
        <nav style={{ padding: '0 20px', height: 52, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0a0a0f', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <strong style={{ letterSpacing: '0.1em', fontSize: '0.8rem' }}>GROUNDLEVEL</strong>
            {isPro && <span style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontSize: '0.6rem', padding: '2px 7px', letterSpacing: '0.08em', border: '1px solid rgba(74,222,128,0.2)' }}>PRO</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isPro && <button onClick={handleUpgrade} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.68rem', letterSpacing: '0.06em' }}>UPGRADE £9/mo</button>}
            {user ? (
              <button onClick={handleSignOut} style={navBtn}>SIGN OUT</button>
            ) : (
              <button onClick={() => router.push('/auth')} style={navBtn}>SIGN IN</button>
            )}
          </div>
        </nav>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0f', position: 'sticky', top: 52, zIndex: 40 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '12px 4px', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #4ade80' : '2px solid transparent', color: tab === t.id ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.65rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: 20 }}>

          {/* ── RECORD TAB ── */}
          {tab === 'record' && (
            <div>
              <div style={sectionTitle}>LOG ENCOUNTER</div>

              {recordMsg && (
                <div style={{ background: recordMsg.type === 'error' ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)', border: `1px solid ${recordMsg.type === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`, color: recordMsg.type === 'error' ? '#f87171' : '#4ade80', padding: '10px 14px', marginBottom: 16, fontSize: '0.78rem' }}>
                  {recordMsg.text}
                </div>
              )}

              {/* Timer */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 400, letterSpacing: '0.05em', color: recording ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                  {fmt(elapsed)}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {!recording
                    ? <button onClick={startRec} style={{ ...actionBtn, background: '#4ade80', color: '#0a0a0f' }}>⏺ START</button>
                    : <button onClick={stopRec} style={{ ...actionBtn, background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>⏹ STOP</button>
                  }
                </div>
              </div>

              {/* Form */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelSm}>ENCOUNTER TYPE</label>
                <select value={encType} onChange={e => setEncType(e.target.value)} style={selStyle}>
                  {ENCOUNTER_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelSm}>BADGE / ID NUMBER (optional)</label>
                <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="e.g. 1234 or SIA-98765" style={inpStyle} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelSm}>WHAT HAPPENED — describe in detail</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Describe the encounter as accurately as possible. Include what was said, what actions were taken, and anything that felt wrong..." style={{ ...inpStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelSm}>LOCATION NOTE (optional)</label>
                <input value={locNote} onChange={e => setLocNote(e.target.value)} placeholder="e.g. High Street, Manchester" style={inpStyle} />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={analyseEncounter} disabled={!desc.trim() || analysing} style={{ ...actionBtn, background: '#4ade80', color: '#0a0a0f', opacity: (!desc.trim() || analysing) ? 0.5 : 1 }}>
                  {analysing ? '⏳ Analysing...' : '🔍 AI ANALYSE'}
                </button>
                <button onClick={saveEncounter} disabled={!desc.trim() || saving || !user} style={{ ...actionBtn, opacity: (!desc.trim() || saving || !user) ? 0.4 : 1 }}>
                  {saving ? 'Saving...' : '💾 SAVE'}
                </button>
                {!user && <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>Sign in to save</span>}
              </div>

              {/* Analysis result */}
              {analysis && flagInfo && (
                <div style={{ marginTop: 24, background: flagInfo.bg, border: `1px solid ${flagInfo.color}44`, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ background: flagInfo.color, color: '#0a0a0f', padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em' }}>{flagInfo.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>Severity {analysis.severity}/10</span>
                  </div>
                  <p style={{ marginBottom: 12, lineHeight: 1.7, fontSize: '0.82rem' }}>{analysis.summary}</p>
                  {analysis.violations?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.66rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>POTENTIAL VIOLATIONS</div>
                      {analysis.violations.map((v, i) => <div key={i} style={{ color: '#f87171', fontSize: '0.78rem', padding: '2px 0' }}>• {v}</div>)}
                    </div>
                  )}
                  {analysis.next_steps?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.66rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>NEXT STEPS</div>
                      {analysis.next_steps.map((s, i) => <div key={i} style={{ color: '#4ade80', fontSize: '0.78rem', padding: '2px 0' }}>→ {s}</div>)}
                    </div>
                  )}
                  {analysis.complaint_worthy && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                      Complaint to: <strong style={{ color: 'white' }}>{analysis.complaint_body}</strong> — go to History to generate letter {!isPro && <span style={{ color: 'rgba(255,255,255,0.3)' }}>(Pro)</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── RIGHTS TAB ── */}
          {tab === 'rights' && (
            <div>
              <div style={sectionTitle}>KNOW YOUR RIGHTS</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {ENCOUNTER_TYPES.map(t => (
                  <button key={t.id} onClick={() => { setRightsType(t.id); setShowScript(false) }} style={{ padding: '7px 12px', background: rightsType === t.id ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${rightsType === t.id ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`, color: rightsType === t.id ? '#4ade80' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {rights && (
                <div>
                  {[
                    { title: 'THEY CAN', items: rights.canDo, color: 'rgba(255,255,255,0.5)', bullet: '→' },
                    { title: 'THEY CANNOT', items: rights.cannotDo, color: '#f87171', bullet: '✗' },
                    { title: 'YOUR RIGHTS', items: rights.yourRights, color: '#4ade80', bullet: '✓' },
                  ].map(section => (
                    <div key={section.title} style={{ marginBottom: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px' }}>
                      <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>{section.title}</div>
                      {section.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: '0.82rem', lineHeight: 1.6, color: section.color }}>
                          <span style={{ flexShrink: 0 }}>{section.bullet}</span> {item}
                        </div>
                      ))}
                    </div>
                  ))}

                  <div style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)', padding: '16px 18px', marginBottom: 16 }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>LEGISLATION</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{rights.legislation}</div>
                  </div>

                  <button onClick={() => setShowScript(!showScript)} style={{ ...actionBtn, marginBottom: showScript ? 12 : 0 }}>
                    {showScript ? 'HIDE' : '💬 SHOW SCRIPT'}
                  </button>
                  {showScript && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 18px', fontSize: '0.85rem', lineHeight: 1.8, color: '#4ade80', fontStyle: 'italic' }}>
                      "{rights.script}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── BLUFF TAB ── */}
          {tab === 'bluff' && (
            <div>
              <div style={sectionTitle}>BLUFF DETECTOR</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.7, marginBottom: 20 }}>
                Type something an officer said. We'll tell you if it's a bluff.
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <input value={bluffInput} onChange={e => setBluffInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkBluff()} placeholder='e.g. "You must give me your name"' style={{ ...inpStyle, flex: 1 }} />
                <button onClick={checkBluff} style={{ ...actionBtn, background: '#4ade80', color: '#0a0a0f', flexShrink: 0 }}>CHECK</button>
              </div>

              {bluffResult && (
                <div style={{ background: bluffResult.risk === 'high' ? 'rgba(248,113,113,0.06)' : 'rgba(251,191,36,0.06)', border: `1px solid ${bluffResult.risk === 'high' ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)'}`, padding: '18px 20px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ background: bluffResult.risk === 'high' ? '#f87171' : bluffResult.risk === 'medium' ? '#fbbf24' : 'rgba(255,255,255,0.2)', color: '#0a0a0f', padding: '3px 10px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                      {bluffResult.verdict}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>{bluffResult.detail}</div>
                </div>
              )}

              <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>COMMON BLUFFS</div>
              {BLUFF_PHRASES.map((p, i) => (
                <div key={i} onClick={() => { setBluffInput(p.phrase); setBluffResult(p) }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', gap: 12 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>"{p.phrase}"</div>
                  <span style={{ background: p.risk === 'high' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.12)', color: p.risk === 'high' ? '#f87171' : '#fbbf24', padding: '2px 8px', fontSize: '0.6rem', letterSpacing: '0.08em', flexShrink: 0 }}>{p.verdict}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div>
              <div style={sectionTitle}>ENCOUNTER HISTORY</div>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 20 }}>Sign in to save and view your encounter history.</div>
                  <button onClick={() => router.push('/auth')} style={{ ...actionBtn, background: '#4ade80', color: '#0a0a0f' }}>SIGN IN</button>
                </div>
              ) : encounters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                  No encounters recorded yet. Use the Record tab to log one.
                </div>
              ) : (
                <>
                  {encounters.map(enc => {
                    const fi = enc.flag ? FLAG_LEVELS[enc.flag] : null
                    const et = ENCOUNTER_TYPES.find(t => t.id === enc.encounter_type)
                    return (
                      <div key={enc.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px', marginBottom: 12, cursor: 'pointer' }} onClick={() => setSelectedEnc(selectedEnc?.id === enc.id ? null : enc)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{et?.icon} {et?.label || enc.encounter_type}</span>
                            {enc.badge_number && <span style={{ marginLeft: 10, fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>#{enc.badge_number}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {fi && <span style={{ background: fi.color, color: '#0a0a0f', padding: '2px 7px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em' }}>{fi.label}</span>}
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(enc.created_at).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{enc.summary || enc.description?.substring(0, 120) + (enc.description?.length > 120 ? '...' : '')}</p>

                        {selectedEnc?.id === enc.id && (
                          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>{enc.description}</p>
                            {enc.complaint_worthy && (
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                <button onClick={(e) => { e.stopPropagation(); generateComplaint(enc) }} disabled={genComplaint} style={{ ...actionBtn, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                                  {genComplaint ? 'Generating...' : `📋 GENERATE COMPLAINT${!isPro ? ' (Pro)' : ''}`}
                                </button>
                              </div>
                            )}
                            {complaint && selectedEnc?.id === enc.id && (
                              <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '18px', fontSize: '0.78rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap' }}>
                                {complaint}
                                <br />
                                <button onClick={() => navigator.clipboard.writeText(complaint)} style={{ ...actionBtn, marginTop: 14, fontSize: '0.65rem' }}>COPY</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

const sectionTitle = { fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }
const labelSm = { display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: '0.08em' }
const inpStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '9px 12px', fontFamily: "'Courier New', monospace", fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }
const selStyle = { ...inpStyle, cursor: 'pointer' }
const actionBtn = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: '0.72rem', letterSpacing: '0.06em' }
const navBtn = { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.68rem', letterSpacing: '0.06em' }
