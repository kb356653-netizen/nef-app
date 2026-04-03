export async function POST(req) {
  try {
    const { prompt, type } = await req.json()

    const system = `You are NEF, a professional sports analyst. Rules:
- Start report immediately, zero introduction
- Never say "আমি", "অবশ্যই", "আমার কাছে তথ্য নেই"
- Always use web_search tool to find real current data
- Show actual betting odds from bookmakers
- Write everything in Bengali
- Be direct and data-driven like a paid analyst`

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
      ?.map(c => c.text)
      .join('') || 'তথ্য পাওয়া যায়নি।'

    return Response.json({ result: text })
  } catch (err) {
    return Response.json({ result: `সার্ভার ত্রুটি: ${err.message}` })
  }
}