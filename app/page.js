'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nef_bankroll_v1'

function loadData() {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}
function saveData(d) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
}

const defaultBankroll = { balance: 0, start: 0, kelly: 5, bets: [], rollover: { start: 0, target: 0, odds: 1.3, current: 0 } }

export default function Home() {
  const [tab, setTab] = useState('analyser')
  const [sport, setSport] = useState('Tennis')
  const [matchInput, setMatchInput] = useState('')
  const [analyseResult, setAnalyseResult] = useState('')
  const [analyseLoading, setAnalyseLoading] = useState(false)
  const [accuInput, setAccuInput] = useState('')
  const [accuResult, setAccuResult] = useState('')
  const [accuLoading, setAccuLoading] = useState(false)
  const [br, setBr] = useState(defaultBankroll)
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

  useEffect(() => {
    const d = loadData()
    if (d) setBr(d)
  }, [])

  async function callAPI(prompt, type = 'analyse') {
    const res = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
    })
    const data = await res.json()
    return data.result
  }

  async function analyseMatch() {
    if (!matchInput.trim()) return
    setAnalyseLoading(true)
    setAnalyseResult('')
    const prompt = `${sport} ম্যাচ বিশ্লেষণ: ${matchInput}

নিচের ফরম্যাটে বাংলায় রিপোর্ট দাও:

🎯 ম্যাচ: ${matchInput} [${sport}]

📊 জয়ের সম্ভাবনা:
• [P1]: XX%
• [P2]: XX%

🔢 স্কোর পূর্বাভাস: (সম্ভাব্য স্কোর)

📈 সাম্প্রতিক ফর্ম:
• [P1]: শেষ ৫ ম্যাচ
• [P2]: শেষ ৫ ম্যাচ

⚔️ H2H: মোট রেকর্ড ও এই সারফেসে

🏟️ সারফেস/ভেন্যু: কে এগিয়ে ও কেন

🏥 ফিটনেস: 🟢/🟡/🔴 উভয়ের অবস্থা

🎯 মূল মার্কেট:
• ম্যাচ বিজয়ী: [নাম] @ XX%
• ${sport === 'Football' ? 'BTTS: হ্যাঁ/না @ XX%\n• ওভার ২.৫ গোল: XX%\n• কর্নার ওভার ৯.৫: XX%' : sport === 'Tennis' ? 'সেট ওভার ২.৫: XX%\n• ডিসাইডিং সেট: XX%\n• প্রথম সেট বিজয়ী: XX%' : 'টোটাল রান ওভার/আন্ডার: XX%\n• টস বিজয়ী সুবিধা: XX%'}

🔄 ROLLOVER সুপারিশ:
• উপযুক্ততা: ✅ উপযুক্ত / ❌ ঝুঁকিপূর্ণ
• সুপারিশকৃত বেট: [বেট টাইপ] @ X.XX অডস
• Rollover-এ ব্যবহার করো: হ্যাঁ/না
• কারণ: [সংক্ষিপ্ত]

🧠 মূল ন্যারেটিভ:
• পয়েন্ট ১
• পয়েন্ট ২  
• পয়েন্ট ৩

🔮 NEF রায়: [বিজয়ী], [স্কোর], আত্মবিশ্বাস XX/100`

    try {
      const r = await callAPI(prompt, 'analyse')
      setAnalyseResult(r)
    } catch { setAnalyseResult('ত্রুটি: সার্ভার সংযোগ ব্যর্থ।') }
    setAnalyseLoading(false)
  }

  async function buildAccu() {
    if (!accuInput.trim()) return
    setAccuLoading(true)
    setAccuResult('')
    const prompt = `নিচের ম্যাচগুলো বিশ্লেষণ করো এবং সবচেয়ে safe accumulator বানাও:

${accuInput}

কাজ:
১. প্রতিটি ম্যাচের জন্য সবচেয়ে নিরাপদ বেট বেছে নাও
২. সবচেয়ে ভালো ২টি ম্যাচ দিয়ে accumulator বানাও (মোট অডস ১.৮ থেকে ২.২)
৩. Rollover-এর জন্য বিশেষভাবে চিহ্নিত করো

ফরম্যাট:

📋 প্রতিটি ম্যাচ:
[ম্যাচ] → সুপারিশ: [বেট] @ X.XX | Confidence: XX%

🏆 SAFE ACCUMULATOR:
বেট ১: [ম্যাচ] → [বেট] @ X.XX
বেট ২: [ম্যাচ] → [বেট] @ X.XX
━━━━━━━━━━━━━━━
মোট অডস: X.XX
মোট Confidence: XX%
Rollover-এর জন্য: ✅/❌

💡 কেন safe:
• কারণ ১
• কারণ ২

⚠️ এড়িয়ে যাও:
[ঝুঁকিপূর্ণ বেট ও কারণ]`

    try {
      const r = await callAPI(prompt, 'accumulator')
      setAccuResult(r)
    } catch { setAccuResult('ত্রুটি: সার্ভার সংযোগ ব্যর্থ।') }
    setAccuLoading(false)
  }

  function setBankroll() {
    const s = parseFloat(brStart) || 0
    const k = parseFloat(brKelly) || 5
    const updated = { ...br, start: s, balance: s, kelly: k }
    setBr(updated)
    saveData(updated)
    const suggested = (s * k / 100).toFixed(0)
    setKellySugg(`💡 Kelly পরামর্শ: প্রতি বেটে সর্বোচ্চ ৳${parseInt(suggested).toLocaleString()} লাগাও (ব্যালেন্সের ${k}%)। এটাই bankroll রক্ষার সেরা উপায়।`)
  }

  function addBet() {
    if (!betMatch || !betOdds || !betAmount) return
    const odds = parseFloat(betOdds)
    const amount = parseFloat(betAmount)
    let profit = 0
    if (betResult === 'win') profit = amount * (odds - 1)
    else if (betResult === 'loss') profit = -amount
    const newBet = { match: betMatch, odds, amount, result: betResult, profit, date: new Date().toLocaleDateString('bn-BD') }
    const newBets = [newBet, ...br.bets]
    let newBalance = br.balance
    if (betResult === 'win') newBalance += profit
    else if (betResult === 'loss') newBalance -= amount
    const updated = { ...br, bets: newBets, balance: newBalance }
    setBr(updated)
    saveData(updated)
    setBetMatch(''); setBetOdds(''); setBetAmount(''); setBetResult('pending')
  }

  function calcRollover() {
    const s = parseFloat(roStart) || 0
    const t = parseFloat(roTarget) || 0
    const o = parseFloat(roOdds) || 1.3
    const c = parseFloat(roCurrent) || s
    if (!s || !t) return
    const remaining = Math.max(0, t - c)
    const pct = Math.min(100, Math.round((c - s) / (t - s) * 100))
    let bets = 0, temp = c
    while (temp < t && bets < 200) { temp *= o; bets++ }
    const steps = []
    let tt = c
    for (let i = 1; i <= Math.min(bets, 6); i++) {
      const next = tt * o
      steps.push({ from: Math.round(tt), to: Math.round(next), n: i })
      tt = next
    }
    setRoResult({ remaining: Math.round(remaining), pct, bets, steps, current: Math.round(c), target: Math.round(t) })
  }

  const wins = br.bets.filter(b => b.result === 'win').length
  const losses = br.bets.filter(b => b.result === 'loss').length
  const totalProfit = br.bets.reduce((acc, b) => acc + (b.profit || 0), 0)

  const tabs = [
    { id: 'analyser', label: 'ম্যাচ বিশ্লেষণ' },
    { id: 'accumulator', label: 'Accumulator' },
    { id: 'bankroll', label: 'Bankroll' },
    { id: 'rollover', label: 'Rollover' },
  ]

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <span style={s.logoNef}>NEF</span>
          <span style={s.logoSub}>Narrative Engine Framework</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.pill}>ATP • WTA • ITF • Football • Cricket</span>
        </div>
      </header>

      {/* Nav */}
      <nav style={s.nav}>
        {tabs.map(t => (
          <button key={t.id} style={tab === t.id ? { ...s.navBtn, ...s.navBtnActive } : s.navBtn} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main style={s.main}>

        {/* ANALYSER */}
        {tab === 'analyser' && (
          <div>
            <div style={s.card}>
              <div style={s.sportRow}>
                {['Tennis', 'Football', 'Cricket'].map(sp => (
                  <button key={sp} style={sport === sp ? { ...s.sportBtn, ...s.sportBtnActive } : s.sportBtn} onClick={() => setSport(sp)}>
                    {sp === 'Tennis' ? '🎾' : sp === 'Football' ? '⚽' : '🏏'} {sp}
                  </button>
                ))}
              </div>
              <label style={s.label}>ম্যাচ লিখুন</label>
              <input
                style={s.input}
                value={matchInput}
                onChange={e => setMatchInput(e.target.value)}
                placeholder={sport === 'Tennis' ? 'Sinner vs Alcaraz' : sport === 'Football' ? 'Real Madrid vs Barcelona' : 'India vs Australia'}
                onKeyDown={e => e.key === 'Enter' && analyseMatch()}
              />
              <button style={analyseLoading ? { ...s.btn, ...s.btnDisabled } : s.btn} onClick={analyseMatch} disabled={analyseLoading}>
                {analyseLoading ? 'বিশ্লেষণ চলছে...' : 'বিশ্লেষণ করুন →'}
              </button>
            </div>
            {analyseResult && <div style={s.result}>{analyseResult}</div>}
          </div>
        )}

        {/* ACCUMULATOR */}
        {tab === 'accumulator' && (
          <div>
            <div style={s.card}>
              <label style={s.label}>ম্যাচগুলো লিখুন (প্রতিটি আলাদা লাইনে)</label>
              <textarea
                style={{ ...s.input, height: '120px', resize: 'vertical' }}
                value={accuInput}
                onChange={e => setAccuInput(e.target.value)}
                placeholder={'Sinner vs Alcaraz\nReal Madrid vs Barcelona\nIndia vs Australia'}
              />
              <button style={accuLoading ? { ...s.btn, ...s.btnDisabled } : s.btn} onClick={buildAccu} disabled={accuLoading}>
                {accuLoading ? 'Safe Combo খুঁজছি...' : 'Safe Combo বানাও →'}
              </button>
            </div>
            {accuResult && <div style={s.result}>{accuResult}</div>}
          </div>
        )}

        {/* BANKROLL */}
        {tab === 'bankroll' && (
          <div>
            <div style={s.metricsGrid}>
              <div style={s.metric}>
                <div style={s.metricLabel}>মোট ব্যালেন্স</div>
                <div style={{ ...s.metricValue, color: br.balance >= br.start ? 'var(--green, #44ff88)' : 'var(--red, #ff4444)' }}>৳{Math.round(br.balance).toLocaleString()}</div>
              </div>
              <div style={s.metric}>
                <div style={s.metricLabel}>মোট লাভ/ক্ষতি</div>
                <div style={{ ...s.metricValue, color: totalProfit >= 0 ? '#44ff88' : '#ff4444' }}>
                  {totalProfit >= 0 ? '+' : ''}৳{Math.round(totalProfit).toLocaleString()}
                </div>
              </div>
              <div style={s.metric}>
                <div style={s.metricLabel}>জয় / হার</div>
                <div style={s.metricValue}><span style={{ color: '#44ff88' }}>{wins}</span> / <span style={{ color: '#ff4444' }}>{losses}</span></div>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.row2}>
                <div>
                  <label style={s.label}>শুরুর ব্যালেন্স (৳)</label>
                  <input style={s.input} type="number" value={brStart} onChange={e => setBrStart(e.target.value)} placeholder="5000" />
                </div>
                <div>
                  <label style={s.label}>Kelly % (৫-১০% সুপারিশ)</label>
                  <input style={s.input} type="number" value={brKelly} onChange={e => setBrKelly(e.target.value)} min="1" max="25" />
                </div>
              </div>
              <button style={s.btn} onClick={setBankroll}>সেট করুন</button>
              {kellySugg && <div style={{ ...s.result, marginTop: '12px' }}>{kellySugg}</div>}
            </div>

            <div style={s.card}>
              <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>নতুন বেট যোগ করুন</div>
              <div style={s.row2}>
                <div>
                  <label style={s.label}>ম্যাচ</label>
                  <input style={s.input} value={betMatch} onChange={e => setBetMatch(e.target.value)} placeholder="Sinner vs Alcaraz" />
                </div>
                <div>
                  <label style={s.label}>অডস</label>
                  <input style={s.input} type="number" value={betOdds} onChange={e => setBetOdds(e.target.value)} placeholder="1.75" step="0.01" />
                </div>
              </div>
              <div style={s.row2}>
                <div>
                  <label style={s.label}>পরিমাণ (৳)</label>
                  <input style={s.input} type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} placeholder="500" />
                </div>
                <div>
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
                <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>বেট হিস্ট্রি</div>
                {br.bets.slice(0, 15).map((b, i) => (
                  <div key={i} style={s.betRow}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{b.match}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>@ {b.odds} | ৳{b.amount} | {b.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {b.result === 'win' && <span style={{ color: '#44ff88', fontSize: '13px' }}>+৳{Math.round(b.profit).toLocaleString()}</span>}
                      {b.result === 'loss' && <span style={{ color: '#ff4444', fontSize: '13px' }}>-৳{b.amount.toLocaleString()}</span>}
                      {b.result === 'pending' && <span style={{ color: '#888', fontSize: '13px' }}>Pending</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROLLOVER */}
        {tab === 'rollover' && (
          <div>
            <div style={s.card}>
              <div style={s.row2}>
                <div>
                  <label style={s.label}>শুরুর পরিমাণ (৳)</label>
                  <input style={s.input} type="number" value={roStart} onChange={e => setRoStart(e.target.value)} placeholder="1000" />
                </div>
                <div>
                  <label style={s.label}>টার্গেট পরিমাণ (৳)</label>
                  <input style={s.input} type="number" value={roTarget} onChange={e => setRoTarget(e.target.value)} placeholder="5000" />
                </div>
              </div>
              <div style={s.row2}>
                <div>
                  <label style={s.label}>প্রতি বেটে অডস (গড়)</label>
                  <input style={s.input} type="number" value={roOdds} onChange={e => setRoOdds(e.target.value)} placeholder="1.3" step="0.01" />
                </div>
                <div>
                  <label style={s.label}>এখন পর্যন্ত (৳)</label>
                  <input style={s.input} type="number" value={roCurrent} onChange={e => setRoCurrent(e.target.value)} placeholder="1000" />
                </div>
              </div>
              <button style={s.btn} onClick={calcRollover}>হিসাব করুন</button>
            </div>

            {roResult && (
              <div>
                <div style={s.metricsGrid}>
                  <div style={s.metric}>
                    <div style={s.metricLabel}>বাকি পরিমাণ</div>
                    <div style={s.metricValue}>৳{roResult.remaining.toLocaleString()}</div>
                  </div>
                  <div style={s.metric}>
                    <div style={s.metricLabel}>আনুমানিক বেট</div>
                    <div style={s.metricValue}>{roResult.bets}</div>
                  </div>
                  <div style={s.metric}>
                    <div style={s.metricLabel}>অগ্রগতি</div>
                    <div style={{ ...s.metricValue, color: '#c8f135' }}>{roResult.pct}%</div>
                  </div>
                </div>

                <div style={s.card}>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Rollover অগ্রগতি</div>
                  <div style={s.progressBar}>
                    <div style={{ ...s.progressFill, width: roResult.pct + '%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '6px' }}>
                    <span>৳{roResult.current.toLocaleString()}</span>
                    <span>৳{roResult.target.toLocaleString()}</span>
                  </div>
                </div>

                <div style={s.card}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>বেট-বাই-বেট পরিকল্পনা</div>
                  {roResult.steps.map((st, i) => (
                    <div key={i} style={s.betRow}>
                      <span style={{ color: '#888', fontSize: '13px' }}>বেট {st.n}</span>
                      <span style={{ fontSize: '14px' }}>৳{st.from.toLocaleString()} → <span style={{ color: '#c8f135', fontWeight: 600 }}>৳{st.to.toLocaleString()}</span></span>
                    </div>
                  ))}
                  {roResult.bets > 6 && <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>...মোট {roResult.bets}টি বেট দরকার</div>}
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
  root: { minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8', fontFamily: "'Noto Sans Bengali', sans-serif" },
  header: { borderBottom: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' },
  logo: { display: 'flex', alignItems: 'baseline', gap: '10px' },
  logoNef: { fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#c8f135', letterSpacing: '2px' },
  logoSub: { fontSize: '12px', color: '#555', fontFamily: "'Space Mono', monospace" },
  headerRight: {},
  pill: { fontSize: '11px', color: '#555', background: '#111', border: '1px solid #222', borderRadius: '99px', padding: '4px 12px', fontFamily: "'Space Mono', monospace" },
  nav: { display: 'flex', borderBottom: '1px solid #1a1a1a', padding: '0 24px', overflowX: 'auto' },
  navBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#555', cursor: 'pointer', padding: '14px 16px', fontSize: '14px', fontFamily: "'Noto Sans Bengali', sans-serif", whiteSpace: 'nowrap', transition: 'color 0.15s' },
  navBtnActive: { color: '#c8f135', borderBottomColor: '#c8f135' },
  main: { maxWidth: '720px', margin: '0 auto', padding: '24px 16px' },
  card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '20px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px', fontFamily: "'Space Mono', monospace" },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: '6px', color: '#e8e8e8', padding: '10px 12px', fontSize: '14px', fontFamily: "'Noto Sans Bengali', sans-serif", marginBottom: '12px', outline: 'none' },
  btn: { background: '#c8f135', color: '#0a0a0a', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Mono', monospace", letterSpacing: '0.5px' },
  btnDisabled: { background: '#2a2a2a', color: '#555', cursor: 'not-allowed' },
  result: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '20px', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.8, color: '#ccc', marginBottom: '16px' },
  sportRow: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  sportBtn: { background: 'none', border: '1px solid #222', borderRadius: '6px', color: '#666', cursor: 'pointer', padding: '7px 14px', fontSize: '13px', fontFamily: "'Noto Sans Bengali', sans-serif" },
  sportBtnActive: { borderColor: '#c8f135', color: '#c8f135', background: '#0f1500' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' },
  metric: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '16px' },
  metricLabel: { fontSize: '11px', color: '#555', marginBottom: '6px', fontFamily: "'Space Mono', monospace" },
  metricValue: { fontSize: '20px', fontWeight: 600, color: '#e8e8e8', fontFamily: "'Space Mono', monospace" },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  betRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' },
  progressBar: { background: '#1a1a1a', borderRadius: '99px', height: '8px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#c8f135', borderRadius: '99px', transition: 'width 0.5s' },
}
