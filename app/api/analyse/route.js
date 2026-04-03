export async function POST(req) {
  try {
    const { matchData, sport } = await req.json()

    let extraInstruction = ''

    if (sport === 'Football') {
      extraInstruction = `
Football-এর জন্য অবশ্যই এই তথ্যগুলো analysis-এ ব্যবহার করো:
- উভয় দলের সর্বশেষ squad ও মূল খেলোয়াড়
- সাম্প্রতিক ৫ ম্যাচের ফর্ম ও গোল
- মূল খেলোয়াড়ের injury/suspension
- Home/Away পারফরম্যান্স পার্থক্য`
    }

    if (sport === 'Cricket') {
      extraInstruction = `
Cricket-এর জন্য অবশ্যই এই তথ্যগুলো analysis-এ ব্যবহার করো:
- এই venue-এর pitch সাধারণত কেমন হয় (batting/bowling/spin friendly)
- এই venue-এ গড় ১ম innings ও ২য় innings স্কোর
- উভয় দলের সর্বশেষ playing XI ও form
- IPL/T20 হলে সর্বশেষ auction-এর পর দলের পরিবর্তন
- টস জিতলে কী করা উচিত এই venue-এ`
    }

    const system = `You are NEF, a professional sports analyst. RULES: Never say "আমি" or ask for more info. Start report immediately. No ## or **. Write in Bengali. Give confident analysis with tables.${extraInstruction}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: matchData }],
      }),
    })

    const data = await res.json()
    if (data.error) return Response.json({ result: `ত্রুটি: ${data.error.message}` })
    const text = data.content?.filter(c => c.type === 'text')?.map(c => c.text).join('') || 'তথ্য পাওয়া যায়নি।'
    return Response.json({ result: text })
  } catch (err) {
    return Response.json({ result: `সার্ভার ত্রুটি: ${err.message}` })
  }
}
