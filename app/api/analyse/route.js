export async function POST(req) {
  try {
    const { prompt, type } = await req.json()

    const system = `তুমি NEF — একজন প্রফেশনাল স্পোর্টস অ্যানালিস্ট। রিপোর্ট লেখার নিয়ম:

- কোনো ভূমিকা নেই, সরাসরি রিপোর্ট শুরু
- "আমি", "অবশ্যই", "নিশ্চয়ই" — এই শব্দ নিষিদ্ধ
- সংখ্যা ও ডেটা দিয়ে কথা বলো
- web search করে real-time তথ্য নাও
- বাজারে প্রচলিত real odds দেখাও
- অজানা player হলেও web search করে তথ্য বের করো
- সম্পূর্ণ বাংলায় লিখবে`

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
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    if (data.error) return Response.json({ result: `ত্রুটি: ${data.error.message}` })

    const text = data.content
      ?.filter(c => c.type === 'text')
      ?.map(c => c.text || '')
      .join('') || 'তথ্য পাওয়া যায়নি।'

    return Response.json({ result: text })

  } catch (err) {
    return Response.json({ result: `সার্ভার ত্রুটি: ${err.message}` })
  }
}