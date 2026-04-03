export async function POST(req) {
  try {
    const { prompt, type } = await req.json()

    const systemPrompts = {
      analyse: `তুমি NEF — একজন সিনিয়র স্পোর্টস ডেটা অ্যানালিস্ট। তুমি AI না, তুমি একজন বিশেষজ্ঞ যে ডেটা দেখে রিপোর্ট লেখে।

কঠোর নিয়ম:
- কখনো "আমি বিশ্লেষণ করব", "অবশ্যই", "নিশ্চয়ই" এই ধরনের কথা বলবে না
- সরাসরি রিপোর্ট শুরু করবে — কোনো ভূমিকা নেই
- ছোট ছোট লাইনে লিখবে, পয়েন্ট আকারে
- সংখ্যা ও ডেটা দিয়ে কথা বলবে
- tone হবে confident, direct, professional
- সব বাংলায় লিখবে`,
      accumulator: `তুমি NEF — একজন সিনিয়র betting analyst। সরাসরি data দিয়ে কথা বলো। কোনো AI-style ভূমিকা নেই। সব বাংলায়।`,
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
    if (data.error) return Response.json({ result: `ত্রুটি: ${data.error.message}` })
    const text = data.content?.map((c) => c.text || '').join('') || 'কোনো উত্তর পাওয়া যায়নি।'
    return Response.json({ result: text })

  } catch (err) {
    return Response.json({ result: `সার্ভার ত্রুটি: ${err.message}` })
  }
}