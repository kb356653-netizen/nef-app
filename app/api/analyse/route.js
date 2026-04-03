export async function POST(req) {
  try {
    const { matchData } = await req.json()

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
        system: `You are NEF, a professional sports analyst. RULES: Never say "আমি" or ask for more info. Start report immediately. No ## or **. Write in Bengali. Give confident analysis with tables.`,
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