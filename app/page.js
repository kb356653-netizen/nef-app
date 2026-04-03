'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nef_v3'
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null } }
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }
const defaultBR = { balance: 0, start: 0, kelly: 5, bets: [] }

export default function Home() {
  const [tab, setTab] = useState('analyser')
  const [sport, setSport] = useState('Tennis')
  const [circuit, setCircuit] = useState('WTA')
  const [p1Name, setP1Name] = useState('')
  const [p1Rank, setP1Rank] = useState('')
  const [p1Odd, setP1Odd] = useState('')
  const [p2Name, setP2Name] = useState('')
  const [p2Rank, setP2Rank] = useState('')
  const [p2Odd, setP2Odd] = useState('')
  const [event, setEvent] = useState('')
  const [surface, setSurface] = useState('')
  const [round, setRound] = useState('')
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

  useEffect(() => { const d = load(); if (d) setBr(d) }, [])

  const circuits = {
    Tennis: ['ATP', 'WTA', 'ITF Men', 'ITF Women', 'Challenger', '125K'],
    Football: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League', 'MLS', 'Other'],
    Cricket: ['Test', 'ODI', 'T20I', 'IPL', 'BBL', 'Other']
  }

  const surfaces = {
    Tennis: ['Hard', 'Clay', 'Grass', 'Indoor Hard'],
    Football: ['Grass', 'Artificial'],
    Cricket: ['Batting Pitch', 'Bowling Pitch', 'Balanced', 'Spin Friendly']
  }

  async function analyse() {
    if (!p1Name || !p2Name) return
    setLoading(true)
    setResult('')

    const matchData = `
নিচের তথ্য দিয়ে সম্পূর্ণ NEF রিপোর্ট তৈরি করো। সরাসরি রিপোর্ট শুরু করো, কোনো ভূমিকা নেই।

খেলার ধরন: ${sport}
সার্কিট: ${circuit}
ইভেন্ট: ${event || 'অজানা'}
সারফেস: ${surface || 'অজানা'}
রাউন্ড: ${round || 'অজানা'}

খেলোয়াড় ১: ${p1Name}
র‍্যাংকিং: ${p1Rank || 'অজানা'}
অডস: ${p1Odd || 'অজানা'}

খেলোয়াড় ২: ${p2Name}
র‍্যাংকিং: ${p2Rank || 'অজানা'}
অডস: ${p2Odd || 'অজানা'}

এই ফরম্যাটে রিপোর্ট দাও:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEF রিপোর্ট | ${sport} | ${circuit}
${p1Name} vs ${p2Name}
${event || ''} | ${surface || ''} | ${round || ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

জয়ের সম্ভাবনা ও অডস
| খেলোয়াড় | র‍্যাংক | জয়% | অডস |
|---------|------|-----|------|
| ${p1Name} | #${p1Rank||'?'} | XX% | ${p1Odd||'X.XX'} |
| ${p2Name} | #${p2Rank||'?'} | XX% | ${p2Odd||'X.XX'} |

সাম্প্রতিক ফর্ম (শেষ ৫ ম্যাচ)
| খেলোয়াড় | ১ | ২ | ৩ | ৪ | ৫ | মোট |
|---------|---|---|---|---|---|-----|
| ${p1Name} | ? | ? | ? | ? | ? | ?-? |
| ${p2Name} | ? | ? | ? | ? | ? | ?-? |

H2H
| মোট | এই সারফেসে | শেষ মিটিং |
|-----|-----------|---------|
| ?-? | ?-? | [স্কোর] |

${sport === 'Tennis' ? `সারফেস পারফরম্যান্স
| সারফেস | ${p1Name} | ${p2Name} | এগিয়ে |
|--------|---------|---------|------|
| Hard | XX% | XX% | ? |
| Clay | XX% | XX% | ? |
| Grass | XX% | XX% | ? |` : ''}

${sport === 'Football' ? `দলীয় পরিসংখ্যান
| পরিসংখ্যান | ${p1Name} | ${p2Name} |
|-----------|---------|---------|
| গড় গোল | X.X | X.X |
| BTTS% | XX% | XX% |
| ওভার ২.৫% | XX% | XX% |
| ক্লিন শিট% | XX% | XX% |` : ''}

${sport === 'Cricket' ? `পিচ ও কন্ডিশন
| বিষয় | তথ্য |
|------|-----|
| পিচ টাইপ | ? |
| গড় স্কোর | ? |
| ব্যাটিং প্রথমে জয়% | XX% |` : ''}

মূল বেটিং মার্কেট
| মার্কেট | পূর্বাভাস | অডস | সম্ভাবনা |
|--------|---------|-----|--------|
| ম্যাচ বিজয়ী | ? | X.XX | XX% |
${sport === 'Tennis' ? `| সেট ওভার ২.৫ | হ্যাঁ/না | X.XX | XX% |
| ডিসাইডিং সেট | হ্যাঁ/না | X.XX | XX% |
| প্রথম সেট | ? | X.XX | XX% |` : ''}
${sport === 'Football' ? `| BTTS | হ্যাঁ/না | X.XX | XX% |
| ওভার ২.৫ গোল | হ্যাঁ/না | X.XX | XX% |
| কর্নার ওভার ৯.৫ | হ্যাঁ/না | X.XX | XX% |` : ''}
${sport === 'Cricket' ? `| টোটাল রান ওভার | XXX.৫ | X.XX | XX% |
| টপ ব্যাটসম্যান | ? | X.XX | XX% |` : ''}

ফিটনেস
| খেলোয়াড় | অবস্থা | নোট |
|---------|------|-----|
| ${p1Name} | 🟢/🟡/🔴 | ? |
| ${p2Name} | 🟢/🟡/🔴 | ? |

সুপারিশ
| ধরন | বেট | অডস | যাবে? |
|-----|-----|-----|------|
| রোলওভার | ? | X.XX | ✅/❌ |
| নরমাল বেট | ? | X.XX | ✅/❌ |
| ব্যাংকরোল | ? | X.XX | ✅/❌ |

মূল ন্যারেটিভ
→ [পয়েন্ট ১]
→ [পয়েন্ট ২]
→ [পয়েন্ট ৩]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
রায়: [বিজয়ী] | [স্কোর] | আত্মবিশ্বাস: XX/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━`

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchData }),
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
        body: JSON.stringify({ matchData: `এই ম্যাচগুলো বিশ্লেষণ করে সবচেয়ে safe 2-odd accumulator বানাও। রোলওভার, নরমাল ও ব্যাংকরোল — তিন ধরনের জন্য আলাদা সুপারিশ দাও। সব table format-এ বাংলায়:\n\n${accuInput}` }),
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
    setBr(updated); save(updated)
    setKellySugg(`Kelly পরামর্শ: প্রতি বেটে সর্বোচ্চ ৳${Math.round(s * k / 100).toLocaleString()} (ব্যালেন্সের ${k}%)`)
  }

  function addBet() {
    if (!betMatch || !betOdds || !betAmount) return
    const odds = parseFloat(betOdds), amount = parseFloat(betAmount)
    let profit = betResult === 'win' ? amount * (odds - 1) : betResult === 'loss' ? -amount : 0
    let newBalance = br.balance
    if (betResult === 'win') newBalance += profit
    else if (betResult === 'loss') newBalance -= amount
    const updated = { ...br, bets: [{ match: betMatch, odds, amount, result: betResult, profit, date: new Date().toLocaleDateString('bn-BD') }, ...br.bets], balance: newBalance }
    setBr(updated); save(updated)
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

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.logo}><span style={s.logoNef}>NEF</span><span style={s.logoSub}>Narrative Engine Framework</span></div>
        <span style={s.pill}>ATP • WTA • ITF • Football • Cricket</span>
      </header>

      <nav style={s.nav}>
        {[['analyser','ম্যাচ বিশ্লেষণ'],['accumulator','Accumulator'],['bankroll','Bankroll'],['rollover','Rollover']].map(([id,label]) => (
          <button key={id} style={tab===id?{...s.navBtn,...s.navActive}:s.navBtn} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </nav>

      <main style={s.main}>

        {tab === 'analyser' && (
          <div>
            {/* Sport selector */}
            <div style={s.card}>
              <div style={s.secTitle}>খেলার ধরন ও সার্কিট</div>
              <div style={s.sportRow}>
                {['Tennis','Football','Cricket'].map(sp => (
                  <button key={sp} style={sport===sp?{...s.sportBtn,...s.sportActive}:s.sportBtn}
                    onClick={()=>{setSport(sp);setCircuit(circuits[sp][0])}}>
                    {sp==='Tennis'?'🎾':sp==='Football'?'⚽':'🏏'} {sp}
                  </button>
                ))}
              </div>
              <div style={s.row2}>
                <div>
                  <label style={s.label}>সার্কিট / লিগ</label>
                  <select style={s.input} value={circuit} onChange={e=>setCircuit(e.target.value)}>
                    {circuits[sport].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
  <label style={s.label}>{sport === 'Cricket' ? 'ভেন্যু (Stadium)' : 'সারফেস / পিচ'}</label>
  {sport === 'Cricket' ? (
    <input style={s.input} value={surface} onChange={e=>setSurface(e.target.value)} placeholder="যেমন: Wankhede, Eden Gardens" />
  ) : (
    <select style={s.input} value={surface} onChange={e=>setSurface(e.target.value)}>
      <option value="">নির্বাচন করুন</option>
      {surfaces[sport].map(c=><option key={c}>{c}</option>)}
    </select>
  )}
</div>
              </div>
              <div style={s.row2}>
                <div>
                  <label style={s.label}>ইভেন্টের নাম</label>
                  <input style={s.input} value={event} onChange={e=>setEvent(e.target.value)} placeholder="যেমন: Miami Open 2025" />
                </div>
                <div>
                  <label style={s.label}>রাউন্ড</label>
                  <input style={s.input} value={round} onChange={e=>setRound(e.target.value)} placeholder="যেমন: QF, SF, R16" />
                </div>
              </div>
            </div>

            {/* Players */}
            <div style={s.row2}>
              <div style={s.card}>
                <div style={s.secTitle}>{sport === 'Tennis' ? '🟢 খেলোয়াড় ১' : '🟢 দল ১'}</div>
                <label style={s.label}>নাম *</label>
                <input style={s.input} value={p1Name} onChange={e=>setP1Name(e.target.value)} placeholder={sport === 'Tennis' ? 'Jessica Pegula' : sport === 'Football' ? 'Real Madrid' : 'Mumbai Indians'} />
                <label style={s.label}>র‍্যাংকিং</label>
                <input style={s.input} type="number" value={p1Rank} onChange={e=>setP1Rank(e.target.value)} placeholder="যেমন: 4" />
                <label style={s.label}>বুকমেকার অডস</label>
                <input style={s.input} type="number" value={p1Odd} onChange={e=>setP1Odd(e.target.value)} placeholder="যেমন: 1.65" step="0.01" />
              </div>
              <div style={s.card}>
                <div style={s.secTitle}>{sport === 'Tennis' ? '🔴 খেলোয়াড় ২' : '🔴 দল ২'}</div>
                <label style={s.label}>নাম *</label>
                <input style={s.input} value={p2Name} onChange={e=>setP2Name(e.target.value)} placeholder={sport === 'Tennis' ? 'Diana Shnaider' : sport === 'Football' ? 'Barcelona' : 'Chennai Super Kings'}/>
                <label style={s.label}>র‍্যাংকিং</label>
                <input style={s.input} type="number" value={p2Rank} onChange={e=>setP2Rank(e.target.value)} placeholder="যেমন: 17" />
                <label style={s.label}>বুকমেকার অডস</label>
                <input style={s.input} type="number" value={p2Odd} onChange={e=>setP2Odd(e.target.value)} placeholder="যেমন: 2.30" step="0.01" />
              </div>
            </div>

            <button style={loading?{...s.btn,...s.btnOff}:s.btn} onClick={analyse} disabled={loading}>
              {loading ? 'বিশ্লেষণ চলছে...' : 'NEF বিশ্লেষণ করুন →'}
            </button>

            {result && <div style={s.result}>{result}</div>}
          </div>
        )}

        {tab === 'accumulator' && (
          <div>
            <div style={s.card}>
              <div style={s.secTitle}>ম্যাচ লিস্ট</div>
              <label style={s.label}>প্রতিটি ম্যাচ আলাদা লাইনে (অডস সহ লিখলে ভালো)</label>
              <textarea style={{...s.input, height:'140px', resize:'vertical'}}
                value={accuInput} onChange={e=>setAccuInput(e.target.value)}
                placeholder={'Sinner vs Alcaraz (ATP Clay, 1.45 vs 2.80)\nReal Madrid vs Barcelona (La Liga, 2.10 vs 3.40)\nIndia vs Australia (T20, 1.80 vs 2.00)'} />
              <button style={accuLoading?{...s.btn,...s.btnOff}:s.btn} onClick={buildAccu} disabled={accuLoading}>
                {accuLoading ? 'বিশ্লেষণ চলছে...' : 'Safe Combo বানাও →'}
              </button>
            </div>
            {accuResult && <div style={s.result}>{accuResult}</div>}
          </div>
        )}

        {tab === 'bankroll' && (
          <div>
            <div style={s.metrics}>
              {[['মোট ব্যালেন্স',`৳${Math.round(br.balance).toLocaleString()}`,br.balance>=br.start?'#44ff88':'#ff4444'],
                ['লাভ/ক্ষতি',`${totalProfit>=0?'+':''}৳${Math.round(totalProfit).toLocaleString()}`,totalProfit>=0?'#44ff88':'#ff4444'],
                ['জয় / হার',`${wins} / ${losses}`,'#e8e8e8']].map(([l,v,c])=>(
                <div key={l} style={s.metric}><div style={s.mLabel}>{l}</div><div style={{...s.mVal,color:c}}>{v}</div></div>
              ))}
            </div>
            <div style={s.card}>
              <div style={s.secTitle}>ব্যাংকরোল সেটআপ</div>
              <div style={s.row2}>
                <div><label style={s.label}>শুরুর ব্যালেন্স (৳)</label><input style={s.input} type="number" value={brStart} onChange={e=>setBrStart(e.target.value)} placeholder="5000" /></div>
                <div><label style={s.label}>Kelly % (৫-১০%)</label><input style={s.input} type="number" value={brKelly} onChange={e=>setBrKelly(e.target.value)} /></div>
              </div>
              <button style={s.btn} onClick={setBankroll}>সেট করুন</button>
              {kellySugg && <div style={{...s.result,marginTop:'12px'}}>{kellySugg}</div>}
            </div>
            <div style={s.card}>
              <div style={s.secTitle}>নতুন বেট</div>
              <div style={s.row2}>
                <div><label style={s.label}>ম্যাচ</label><input style={s.input} value={betMatch} onChange={e=>setBetMatch(e.target.value)} placeholder="Pegula vs Shnaider" /></div>
                <div><label style={s.label}>অডস</label><input style={s.input} type="number" value={betOdds} onChange={e=>setBetOdds(e.target.value)} placeholder="1.75" /></div>
              </div>
              <div style={s.row2}>
                <div><label style={s.label}>পরিমাণ (৳)</label><input style={s.input} type="number" value={betAmount} onChange={e=>setBetAmount(e.target.value)} placeholder="500" /></div>
                <div><label style={s.label}>ফলাফল</label>
                  <select style={s.input} value={betResult} onChange={e=>setBetResult(e.target.value)}>
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
                <div style={s.secTitle}>বেট হিস্ট্রি</div>
                {br.bets.slice(0,15).map((b,i)=>(
                  <div key={i} style={s.betRow}>
                    <div><div style={{fontSize:'14px',fontWeight:500}}>{b.match}</div><div style={{fontSize:'12px',color:'#888'}}>@ {b.odds} | ৳{b.amount} | {b.date}</div></div>
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
              <div style={s.secTitle}>Rollover ক্যালকুলেটর</div>
              <div style={s.row2}>
                <div><label style={s.label}>শুরুর পরিমাণ (৳)</label><input style={s.input} type="number" value={roStart} onChange={e=>setRoStart(e.target.value)} placeholder="1000" /></div>
                <div><label style={s.label}>টার্গেট (৳)</label><input style={s.input} type="number" value={roTarget} onChange={e=>setRoTarget(e.target.value)} placeholder="5000" /></div>
              </div>
              <div style={s.row2}>
                <div><label style={s.label}>প্রতি বেটে অডস</label><input style={s.input} type="number" value={roOdds} onChange={e=>setRoOdds(e.target.value)} placeholder="1.3" step="0.01" /></div>
                <div><label style={s.label}>এখন পর্যন্ত (৳)</label><input style={s.input} type="number" value={roCurrent} onChange={e=>setRoCurrent(e.target.value)} placeholder="1000" /></div>
              </div>
              <button style={s.btn} onClick={calcRollover}>হিসাব করুন</button>
            </div>
            {roResult && (
              <div>
                <div style={s.metrics}>
                  {[['বাকি',`৳${roResult.remaining.toLocaleString()}`,'#e8e8e8'],['বেট দরকার',`${roResult.bets}টি`,'#e8e8e8'],['অগ্রগতি',`${roResult.pct}%`,'#c8f135']].map(([l,v,c])=>(
                    <div key={l} style={s.metric}><div style={s.mLabel}>{l}</div><div style={{...s.mVal,color:c}}>{v}</div></div>
                  ))}
                </div>
                <div style={s.card}>
                  <div style={s.progBar}><div style={{...s.progFill,width:roResult.pct+'%'}} /></div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#888',marginTop:'6px'}}>
                    <span>৳{roResult.current.toLocaleString()}</span><span>৳{roResult.target.toLocaleString()}</span>
                  </div>
                </div>
                <div style={s.card}>
                  <div style={s.secTitle}>বেট-বাই-বেট পরিকল্পনা</div>
                  {roResult.steps.map((st,i)=>(
                    <div key={i} style={s.betRow}>
                      <span style={{color:'#888',fontSize:'13px'}}>বেট {st.n}</span>
                      <span>৳{st.from.toLocaleString()} → <span style={{color:'#c8f135',fontWeight:600}}>৳{st.to.toLocaleString()}</span></span>
                    </div>
                  ))}
                  {roResult.bets>8&&<div style={{fontSize:'12px',color:'#888',marginTop:'8px'}}>...মোট {roResult.bets}টি বেট দরকার</div>}
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
  root:{minHeight:'100vh',background:'#0a0a0a',color:'#e8e8e8',fontFamily:"'Noto Sans Bengali',sans-serif"},
  header:{borderBottom:'1px solid #1a1a1a',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'},
  logo:{display:'flex',alignItems:'baseline',gap:'10px'},
  logoNef:{fontFamily:"'Space Mono',monospace",fontSize:'22px',fontWeight:700,color:'#c8f135',letterSpacing:'2px'},
  logoSub:{fontSize:'11px',color:'#555',fontFamily:"'Space Mono',monospace"},
  pill:{fontSize:'11px',color:'#555',background:'#111',border:'1px solid #1a1a1a',borderRadius:'99px',padding:'4px 12px'},
  nav:{display:'flex',borderBottom:'1px solid #1a1a1a',padding:'0 24px',overflowX:'auto'},
  navBtn:{background:'none',border:'none',borderBottom:'2px solid transparent',color:'#555',cursor:'pointer',padding:'14px 16px',fontSize:'14px',fontFamily:"'Noto Sans Bengali',sans-serif",whiteSpace:'nowrap'},
  navActive:{color:'#c8f135',borderBottomColor:'#c8f135'},
  main:{maxWidth:'760px',margin:'0 auto',padding:'24px 16px'},
  card:{background:'#111',border:'1px solid #1a1a1a',borderRadius:'10px',padding:'20px',marginBottom:'16px'},
  secTitle:{fontSize:'12px',fontWeight:600,color:'#888',marginBottom:'14px',fontFamily:"'Space Mono',monospace",letterSpacing:'0.5px',textTransform:'uppercase'},
  label:{display:'block',fontSize:'12px',color:'#666',marginBottom:'5px'},
  input:{width:'100%',background:'#0a0a0a',border:'1px solid #222',borderRadius:'6px',color:'#e8e8e8',padding:'9px 12px',fontSize:'14px',fontFamily:"'Noto Sans Bengali',sans-serif",marginBottom:'10px',outline:'none'},
  btn:{background:'#c8f135',color:'#0a0a0a',border:'none',borderRadius:'6px',padding:'11px 24px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace",width:'100%',marginBottom:'4px'},
  btnOff:{background:'#2a2a2a',color:'#555',cursor:'not-allowed'},
  result:{background:'#0d0d0d',border:'1px solid #1a1a1a',borderRadius:'10px',padding:'20px',whiteSpace:'pre-wrap',fontSize:'13px',lineHeight:2,color:'#ccc',marginBottom:'16px',fontFamily:"'Space Mono',monospace"},
  sportRow:{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'},
  sportBtn:{background:'none',border:'1px solid #222',borderRadius:'6px',color:'#666',cursor:'pointer',padding:'8px 16px',fontSize:'13px'},
  sportActive:{borderColor:'#c8f135',color:'#c8f135',background:'#0f1500'},
  row2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'},
  metrics:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'},
  metric:{background:'#111',border:'1px solid #1a1a1a',borderRadius:'10px',padding:'16px'},
  mLabel:{fontSize:'11px',color:'#555',marginBottom:'6px',fontFamily:"'Space Mono',monospace"},
  mVal:{fontSize:'20px',fontWeight:600,fontFamily:"'Space Mono',monospace"},
  betRow:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #1a1a1a'},
  progBar:{background:'#1a1a1a',borderRadius:'99px',height:'8px',overflow:'hidden'},
  progFill:{height:'100%',background:'#c8f135',borderRadius:'99px',transition:'width 0.5s'},
}