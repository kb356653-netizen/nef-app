export async function POST(req) {
  try {
    const { prompt, type } = await req.json()

    const systemPrompts = {
      analyse: `তুমি NEF, একটি এলিট স্পোর্টস বিশ্লেষণ ইঞ্জিন। সব উত্তর বাংলায় দেবে। তথ্যবহুল ও সংক্ষিপ্ত রিপোর্ট দেবে।`,
      accumulator: `তুমি NEF Accumulator Builder। একাধিক ম্যাচ বিশ্লেষণ করে সবচেয়ে safe combo বেছে দেবে। সব উত্তর বাংলায়।`,
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompts[type] || systemPrompts.analyse,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()

    if (data.error) {
      return Response.json({ result: `API ত্রুটি: ${data.error.message}` })
    }

    const text = data.content?.map((c) => c.text || '').join('') || 'কোনো উত্তর পাওয়া যায়নি।'
    return Response.json({ result: text })

  } catch (err) {
    return Response.json({ result: `সার্ভার ত্রুটি: ${err.message}` })
  }
}