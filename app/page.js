'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nef_bankroll_v1'
function loadData() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null } }
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }
const defaultBR = { balance: 0, start: 0, kelly: 5, bets: [], rollover: { start: 0, target: 0, odds: 1.3, current: 0 } }

export default function Home() {
  const [tab, setTab] = useState('analyser')
  const [sport, setSport] = useState('Tennis')
  const [circuit, setCircuit] = useState('WTA')
  const [form, setForm] = useState({
    p1Name: '', p1Rank: '', p1Odd: '',
    p2Name: '', p2Rank: '', p2Odd: '',
    event: '', surface: '', round: ''
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [accuInput, setAccuInput] = useState('')
  const [accuResult, setAccuResult] = useState('')
  const [accuLoading, setAccuLoading] = useState(false)
  const [br, setBr] = useState(defaultBR)
  const [brStart, setBrStart] = useState('')
  const [brKelly, setBrKelly] = useState('5')
  const [betMatch, setBetMatch] = useState('')
  const [betOdds, setBetOdds] = useState('')
  const [betAmount, setBetAmount] = useState('')
  const [betResult, setBetResult] = useState('pending')
  const [kellySugg, setKellySugg] = useState('')
  const [roStart, setRoStart] = useState('')
  const [roTarget, setRoTarget] = useState('')
  const [roOdds, setRoOdds] = useState('1.3')
  const [roCurrent, setRoCurrent] = useState('')
  const [roResult, setRoResult] = useState(null)

  useEffect(() => { const d = loadData(); if (d) setBr(d) }, [])

  const circuits = {
    Tennis: ['ATP', 'WTA', 'ITF Men', 'ITF Women', 'Challenger', '125K'],
    Football: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'MLS', 'Other'],
    Cricket: ['Test', 'ODI', 'T20I', 'IPL', 'BBL', 'Other']
  }

  const surfaces = {
    Tennis: ['Hard', 'Clay', 'Grass', 'Indoor Hard'],
    Football: ['Grass', 'Artificial'],
    Cricket: ['Batting Pitch', 'Bowling Pitch', 'Balanced', 'Spin Friendly']
  }

  async function analyse() {
    if (!form.p1Name || !form.p2Name) return
    setLoading(true)
    setResult('')

    const matchData = `
খেলার ধরন: ${sport}
সার্কিট/লিগ: ${circuit}
ইভেন্ট: ${form.event || 'অজানা'}
সারফেস/পিচ: ${form.surface || 'অজানা'}
রাউন্ড: ${form.round || 'অজানা'}

খেলোয়াড়/দল ১:
- নাম: ${form.p1Name}
- র‍্যাংকিং: ${form.p1Rank || 'অজানা'}
- বুকমেকার অডস: ${form.p1Odd || 'অজানা'}

খেলোয়াড়/দল ২:
- নাম: ${form.p2Name}
- র‍্যাংকিং: ${form.p2Rank || 'অজানা'}
- বুকমেকার অডস: ${form.p2Odd || 'অজানা'}
`
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchData, type: 'analyse' }),
      })
      const data = await res.json()
      setResult(data.result)
    } catch { setResult('সার্ভার ত্রুটি।') }
    setLoading(false)
  }

  async function buildAccu() {
    if (!accuInput.trim()) return
    setAccuLoading(true)
    setAccuResult('')
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchData: `এই ম্যাচগুলো বিশ্লেষণ করে সবচেয়ে safe 2-odd accumulator বানাও:\n${accuInput}\n\nরোলওভার, নরমাল ও ব্যাংকরোল — তিন ধরনের জন্য আলাদা সুপারিশ দাও। সব table format-এ।`, type: 'accumulator' }),
      })
      const data = await res.json()
      setAccuResult(data.result)
    } catch { setAccuResult('সার্ভার ত্রুটি।') }
    setAccuLoading(false)
  }

  function setBankroll() {
    const s = parseFloat(brStart) || 0
    const k = parseFloat(brKelly) || 5
    const updated = { ...br, start: s, balance: s, kelly: k }
    setBr(updated); saveData(updated)
    setKellySugg(`Kelly পরামর্শ: প্রতি বেটে সর্বোচ্চ ৳${Math.round(s * k / 100).toLocaleString()} (ব্যালেন্সের ${k}%)`)
  }

  function addBet() {
    if (!betMatch || !betOdds || !betAmount) return
    const odds = parseFloat(betOdds), amount = parseFloat(betAmount)
    let profit = betResult === 'win' ? amount * (odds - 1) : betResult === 'loss' ? -amount : 0
    const newBet = { match: betMatch, odds, amount, result: betResult, profit, date: new Date().toLocaleDateString('bn-BD') }
    let newBalance = br.balance
    if (betResult === 'win') newBalance += profit
    else if (betResult === 'loss') newBalance -= amount
    const updated = { ...br, bets: [newBet, ...br.bets], balance: newBalance }
    setBr(updated); saveData(updated)
    setBetMatch(''); setBetOdds(''); setBetAmount(''); setBetResult('pending')
  }

  function calcRollover() {
    const s = parseFloat(roStart) || 0, t = parseFloat(roTarget) || 0
    const o = parseFloat(roOdds) || 1.3, c = parseFloat(roCurrent) || s
    if (!s || !t) return
    const pct = Math.min(100, Math.round((c - s) / (t - s) * 100))
    let bets = 0, temp = c
    while (temp < t && bets < 200) { temp *= o; bets++ }
    const steps = []
    let tt = c
    for (let i = 1; i <= Math.min(bets, 8); i++) {
      const next = tt * o; steps.push({ from: Math.round(tt), to: Math.round(next), n: i }); tt = next
    }
    setRoResult({ remaining: Math.round(Math.max(0, t - c)), pct, bets, steps, current: Math.round(c), target: Math.round(t) })
  }

  const wins = br.bets.filter(b => b.result === 'win').length
  const losses = br.bets.filter(b => b.result === 'loss').length
  const totalProfit = br.bets.reduce((a, b) => a + (b.profit || 0), 0)

  const F = ({ label, value, onChange, placeholder, type = 'text', half }) => (
    <div style={{ ...(half ? s.half : s.full) }}>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} />
    </div>
  )

  const Sel = ({ label, value, onChange, options, half }) => (
    <div style={{ ...(half ? s.half : s.full) }}>
      <label style={s.label}>{label}</label>
      <select style={s.input} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.logo}><span style={s.logoNef}>NEF</span><span style={s.logoSub}>Narrative Engine Framework</span></div>
        <span style={s.pill}>ATP • WTA • ITF • Football • Cricket</span>
      </header>

      <nav style={s.nav}>
        {[['analyser','ম্যাচ বিশ্লেষণ'],['accumulator','Accumulator'],['bankroll','Bankroll'],['rollover','Rollover']].map(([id, label]) => (
          <button key={id} style={tab === id ? {...s.navBtn, ...s.navActive} : s.navBtn} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      <main style={s.main}>

        {tab === 'analyser' && (
          <div>
            <div style={s.card}>
              <div style={s.sectionTitle}>খেলার ধরন</div>
              <div style={s.sportRow}>
                {['Tennis','Football','Cricket'].map(sp => (
                  <button key={sp} style={sport === sp ? {...s.sportBtn, ...s.sportActive} : s.sportBtn}
                    onClick={() => { setSport(sp); setCircuit(circuits[sp][0]) }}>
                    {sp === 'Tennis' ? '🎾' : sp === 'Football' ? '⚽' : '🏏'} {sp}
                  </button>
                ))}
              </div>

              <div style={s.row2}>
                <Sel label="সার্কিট / লিগ" value={circuit} onChange={setCircuit} options={circuits[sport]} half />
                <Sel label="সারফেস / পিচ" value={form.surface || surfaces[sport][0]} onChange={v => setForm({...form, surface: v})} options={surfaces[sport]} half />
              </div>
              <div style={s.row2}>
                <F label="ইভেন্টের নাম" value={form.event} onChange={v => setForm({...form, event: v})} placeholder="যেমন: Miami Open 2025" half />
                <F label="রাউন্ড" value={form.round} onChange={v => setForm({...form, round: v})} placeholder="যেমন: QF, SF, R16" half />
              </div>
            </div>

            <div style={s.row2}>
              <div style={s.card}>
                <div style={s.sectionTitle}>🟢 খেলোয়াড় / দল ১</div>
                <F label="নাম *" value={form.p1Name} onChange={v => setForm({...form, p1Name: v})} placeholder="Jessica Pegula" />
                <F label="র‍্যাংকিং" value={form.p1Rank} onChange={v => setForm({...form, p1Rank: v})} placeholder="যেমন: 4" type="number" />
                <F label="বুকমেকার অডস" value={form.p1Odd} onChange={v => setForm({...form, p1Odd: v})} placeholder="যেমন: 1.65" type="number" />
              </div>
              <div style={s.card}>
                <div style={s.sectionTitle}>🔴 খেলোয়াড় / দল ২</div>
                <F label="নাম *" value={form.p2Name} onChange={v => setForm({...form, p2Name: v})} placeholder="Diana Shnaider" />
                <F label="র‍্যাংকিং" value={form.p2Rank} onChange={v => setForm({...form, p2Rank: v})} placeholder="যেমন: 17" type="number" />
                <F label="বুকমেকার অডস" value={form.p2Odd} onChange={v => setForm({...form, p2Odd: v})} placeholder="যেমন: 2.30" type="number" />
              </div>
            </div>

            <button style={loading ? {...s.btn, ...s.btnOff} : s.btn} onClick={analyse} disabled={loading}>
              {loading ? 'বিশ্লেষণ চলছে...' : 'NEF বিশ্লেষণ করুন →'}
            </button>

            {result && <div style={s.result}>{result}</div>}
          </div>
        )}

        {tab === 'accumulator' && (
          <div>
            <div style={s.card}>
              <div style={s.sectionTitle}>ম্যাচ লিস্ট</div>
              <label style={s.label}>প্রতিটি ম্যাচ আলাদা লাইনে লিখুন</label>
              <textarea style={{...s.input, height: '140px', resize: 'vertical'}}
                value={accuInput} onChange={e => setAccuInput(e.target.value)}
                placeholder={'Sinner vs Alcaraz (ATP, Clay, 1.45 vs 2.80)\nReal Madrid vs Barcelona (La Liga, 2.10 vs 3.20 vs 3.40)\nIndia vs Australia (T20, 1.80 vs 2.00)'} />
              <button style={accuLoading ? {...s.btn, ...s.btnOff} : s.btn} onClick={buildAccu} disabled={accuLoading}>
                {accuLoading ? 'Safe Combo খুঁজছি...' : 'Safe Combo বানাও →'}
              </button>
            </div>
            {accuResult && <div style={s.result}>{accuResult}</div>}
          </div>
        )}

        {tab === 'bankroll' && (
          <div>
            <div style={s.metrics}>
              {[['মোট ব্যালেন্স', `৳${Math.round(br.balance).toLocaleString()}`, br.balance >= br.start ? '#44ff88' : '#ff4444'],
                ['লাভ/ক্ষতি', `${totalProfit >= 0 ? '+' : ''}৳${Math.round(totalProfit).toLocaleString()}`, totalProfit >= 0 ? '#44ff88' : '#ff4444'],
                ['জয় / হার', `${wins} / ${losses}`, '#e8e8e8']].map(([l, v, c]) => (
                <div key={l} style={s.metric}><div style={s.mLabel}>{l}</div><div style={{...s.mValue, color: c}}>{v}</div></div>
              ))}
            </div>
            <div style={s.card}>
              <div style={s.row2}>
                <F label="শুরুর ব্যালেন্স (৳)" value={brStart} onChange={setBrStart} placeholder="5000" type="number" half />
                <F label="Kelly % (৫-১০%)" value={brKelly} onChange={setBrKelly} placeholder="5" type="number" half />
              </div>
              <button style={s.btn} onClick={setBankroll}>সেট করুন</button>
              {kellySugg && <div style={{...s.result, marginTop: '12px'}}>{kellySugg}</div>}
            </div>
            <div style={s.card}>
              <div style={s.sectionTitle}>নতুন বেট</div>
              <div style={s.row2}>
                <F label="ম্যাচ" value={betMatch} onChange={setBetMatch} placeholder="Pegula vs Shnaider" half />
                <F label="অডস" value={betOdds} onChange={setBetOdds} placeholder="1.75" type="number" half />
              </div>
              <div style={s.row2}>
                <F label="পরিমাণ (৳)" value={betAmount} onChange={setBetAmount} placeholder="500" type="number" half />
                <div style={s.half}>
                  <label style={s.label}>ফলাফল</label>
                  <select style={s.input} value={betResult} onChange={e => setBetResult(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="win">জয় ✅</option>
                    <option value="loss">হার ❌</option>
                  </select>
                </div>
              </div>
              <button style={s.btn} onClick={addBet}>বেট যোগ করুন</button>
            </div>
            {br.bets.length > 0 && (
              <div style={s.card}>
                <div style={s.sectionTitle}>বেট হিস্ট্রি</div>
                {br.bets.slice(0,15).map((b, i) => (
                  <div key={i} style={s.betRow}>
                    <div><div style={{fontSize:'14px',fontWeight:500}}>{b.match}</div>
                    <div style={{fontSize:'12px',color:'#888'}}>@ {b.odds} | ৳{b.amount} | {b.date}</div></div>
                    <div>{b.result==='win'?<span style={{color:'#44ff88'}}>+৳{Math.round(b.profit).toLocaleString()}</span>:b.result==='loss'?<span style={{color:'#ff4444'}}>-৳{b.amount}</span>:<span style={{color:'#888'}}>Pending</span>}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'rollover' && (
          <div>
            <div style={s.card}>
              <div style={s.row2}>
                <F label="শুরুর পরিমাণ (৳)" value={roStart} onChange={setRoStart} placeholder="1000" type="number" half />
                <F label="টার্গেট পরিমাণ (৳)" value={roTarget} onChange={setRoTarget} placeholder="5000" type="number" half />
              </div>
              <div style={s.row2}>
                <F label="প্রতি বেটে অডস" value={roOdds} onChange={setRoOdds} placeholder="1.3" type="number" half />
                <F label="এখন পর্যন্ত (৳)" value={roCurrent} onChange={setRoCurrent} placeholder="1000" type="number" half />
              </div>
              <button style={s.btn} onClick={calcRollover}>হিসাব করুন</button>
            </div>
            {roResult && (
              <div>
                <div style={s.metrics}>
                  {[['বাকি', `৳${roResult.remaining.toLocaleString()}`,'#e8e8e8'],
                    ['বেট দরকার', `${roResult.bets}টি`,'#e8e8e8'],
                    ['অগ্রগতি', `${roResult.pct}%`,'#c8f135']].map(([l,v,c])=>(
                    <div key={l} style={s.metric}><div style={s.mLabel}>{l}</div><div style={{...s.mValue,color:c}}>{v}</div></div>
                  ))}
                </div>
                <div style={s.card}>
                  <div style={{fontSize:'13px',color:'#888',marginBottom:'8px'}}>অগ্রগতি</div>
                  <div style={s.progBar}><div style={{...s.progFill, width: roResult.pct+'%'}} /></div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#888',marginTop:'6px'}}>
                    <span>৳{roResult.current.toLocaleString()}</span><span>৳{roResult.target.toLocaleString()}</span>
                  </div>
                </div>
                <div style={s.card}>
                  <div style={s.sectionTitle}>বেট-বাই-বেট পরিকল্পনা</div>
                  {roResult.steps.map((st,i)=>(
                    <div key={i} style={s.betRow}>
                      <span style={{color:'#888',fontSize:'13px'}}>বেট {st.n}</span>
                      <span>৳{st.from.toLocaleString()} → <span style={{color:'#c8f135',fontWeight:600}}>৳{st.to.toLocaleString()}</span></span>
                    </div>
                  ))}
                  {roResult.bets > 8 && <div style={{fontSize:'12px',color:'#888',marginTop:'8px'}}>...মোট {roResult.bets}টি বেট দরকার</div>}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

const s = {
  root: { minHeight:'100vh', background:'#0a0a0a', color:'#e8e8e8', fontFamily:"'Noto Sans Bengali', sans-serif" },
  header: { borderBottom:'1px solid #1a1a1a', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' },
  logo: { display:'flex', alignItems:'baseline', gap:'10px' },
  logoNef: { fontFamily:"'Space Mono', monospace", fontSize:'22px', fontWeight:700, color:'#c8f135', letterSpacing:'2px' },
  logoSub: { fontSize:'11px', color:'#555', fontFamily:"'Space Mono', monospace" },
  pill: { fontSize:'11px', color:'#555', background:'#111', border:'1px solid #1a1a1a', borderRadius:'99px', padding:'4px 12px' },
  nav: { display:'flex', borderBottom:'1px solid #1a1a1a', padding:'0 24px', overflowX:'auto' },
  navBtn: { background:'none', border:'none', borderBottom:'2px solid transparent', color:'#555', cursor:'pointer', padding:'14px 16px', fontSize:'14px', fontFamily:"'Noto Sans Bengali', sans-serif", whiteSpace:'nowrap' },
  navActive: { color:'#c8f135', borderBottomColor:'#c8f135' },
  main: { maxWidth:'760px', margin:'0 auto', padding:'24px 16px' },
  card: { background:'#111', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'20px', marginBottom:'16px' },
  sectionTitle: { fontSize:'13px', fontWeight:600, color:'#888', marginBottom:'14px', fontFamily:"'Space Mono', monospace", letterSpacing:'0.5px' },
  label: { display:'block', fontSize:'12px', color:'#666', marginBottom:'5px' },
  input: { width:'100%', background:'#0a0a0a', border:'1px solid #222', borderRadius:'6px', color:'#e8e8e8', padding:'9px 12px', fontSize:'14px', fontFamily:"'Noto Sans Bengali', sans-serif", marginBottom:'10px', outline:'none' },
  btn: { background:'#c8f135', color:'#0a0a0a', border:'none', borderRadius:'6px', padding:'11px 24px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:"'Space Mono', monospace", width:'100%', marginBottom:'4px' },
  btnOff: { background:'#2a2a2a', color:'#555', cursor:'not-allowed' },
  result: { background:'#111', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.9, color:'#ccc', marginBottom:'16px', fontFamily:"'Space Mono', monospace" },
  sportRow: { display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' },
  sportBtn: { background:'none', border:'1px solid #222', borderRadius:'6px', color:'#666', cursor:'pointer', padding:'8px 16px', fontSize:'13px' },
  sportActive: { borderColor:'#c8f135', color:'#c8f135', background:'#0f1500' },
  row2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  half: { width:'100%' },
  full: { width:'100%' },
  metrics: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'16px' },
  metric: { background:'#111', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'16px' },
  mLabel: { fontSize:'11px', color:'#555', marginBottom:'6px', fontFamily:"'Space Mono', monospace" },
  mValue: { fontSize:'20px', fontWeight:600, fontFamily:"'Space Mono', monospace" },
  betRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #1a1a1a' },
  progBar: { background:'#1a1a1a', borderRadius:'99px', height:'8px', overflow:'hidden' },
  progFill: { height:'100%', background:'#c8f135', borderRadius:'99px', transition:'width 0.5s' },
}
