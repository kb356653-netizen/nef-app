export async function POST(req) {
  try {
    const { matchData, type } = await req.json()

    const system = `You are NEF, a professional sports analyst. 

STRICT RULES:
- Start DIRECTLY with the report. Zero introduction.
- Never say "আমি", "অবশ্যই", "আফসোস", "তথ্য নেই"
- Use web search to find recent form, H2H, injuries
- Output must be clean plain text with ASCII tables using | and - characters
- No ## markdown. No **bold**. No asterisks anywhere.
- Write everything in Bengali
- Give confident analysis even with partial data`

    const userPrompt = `এই তথ্য দিয়ে সম্পূর্ণ NEF রিপোর্ট তৈরি করো:

${matchData}

web search করে এই তথ্যগুলো খুঁজে নাও:
- উভয় খেলোয়াড়ের সাম্প্রতিক ফর্ম (শেষ ৫-১০ ম্যাচ)
- H2H রেকর্ড
- সারফেসে পারফরম্যান্স
- কোনো আঘাত বা সংবাদ

তারপর এই ফরম্যাটে রিপোর্ট দাও:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEF রিপোর্ট | [SPORT] | [Circuit]
[P1] vs [P2]
[Event] | [Surface] | [Round]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

জয়ের সম্ভাবনা ও অডস
| খেলোয়াড় | র‍্যাংকিং | জয়% | অডস |
|---------|---------|-----|------|
| [P1]    | #XX     | XX% | X.XX |
| [P2]    | #XX     | XX% | X.XX |

সাম্প্রতিক ফর্ম (শেষ ৫ ম্যাচ)
| খেলোয়াড় | ১ | ২ | ৩ | ৪ | ৫ | মোট |
|---------|---|---|---|---|---|-----|
| [P1]    | W | W | L | W | W | ৪-১ |
| [P2]    | W | L | W | W | L | ৩-২ |

H2H রেকর্ড
| মোট | এই সারফেসে | শেষ মিটিং |
|-----|-----------|----------|
| X-X | X-X       | [score]  |

সারফেস বিশ্লেষণ
| সারফেস | [P1] জয়% | [P2] জয়% | সুবিধা |
|--------|---------|---------|-------|
| [surface] | XX% | XX% | [name] |

মূল বেটিং মার্কেট
| মার্কেট | পূর্বাভাস | অডস | সম্ভাবনা |
|--------|---------|-----|--------|
| ম্যাচ বিজয়ী | [name] | X.XX | XX% |
| সেট ওভার ২.৫ | হ্যাঁ/না | X.XX | XX% |
| ডিসাইডিং সেট | হ্যাঁ/না | X.XX | XX% |
| প্রথম সেট | [name] | X.XX | XX% |

ফিটনেস
| খেলোয়াড় | অবস্থা | নোট |
|---------|------|-----|
| [P1] | 🟢/🟡/🔴 | [note] |
| [P2] | 🟢/🟡/🔴 | [note] |

সুপারিশ
| ধরন | বেট | অডস | উপযুক্ততা |
|-----|-----|-----|---------|
| রোলওভার | [bet] | X.XX | ✅/❌ |
| নরমাল | [bet] | X.XX | ✅/❌ |
| ব্যাংকরোল | [bet] | X.XX | ✅/❌ |

মূল ন্যারেটিভ
→ [point 1]
→ [point 2]
→ [point 3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
রায়: [winner] | [score] | আত্মবিশ্বাস: XX/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

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
        messages: [{ role: 'user', content: userPrompt }],
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
