# NEF — Sports Analyser
### Narrative Engine Framework | ATP • WTA • ITF • Football • Cricket

---

## Vercel-এ Deploy করার নির্দেশ

### ধাপ ১ — GitHub-এ Upload করো
1. github.com-এ যাও → New Repository বানাও → নাম দাও `nef-app`
2. এই পুরো folder-এর সব file upload করো

### ধাপ ২ — Vercel-এ Deploy করো
1. vercel.com-এ যাও (GitHub দিয়ে login করো)
2. "New Project" → তোমার `nef-app` repo select করো
3. Deploy বাটন চাপো

### ধাপ ৩ — API Key দাও (সবচেয়ে গুরুত্বপূর্ণ)
Vercel Dashboard → তোমার project → Settings → Environment Variables

এখানে যোগ করো:
```
Name:  ANTHROPIC_API_KEY
Value: sk-ant-xxxxxxxx (তোমার key)
```

API key পাবে: console.anthropic.com → API Keys

### ধাপ ৪ — Redeploy করো
Environment variable দেওয়ার পর → Deployments → Redeploy

---

## Local-এ চালাতে চাইলে

```bash
# .env.local file বানাও
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local

# Dependencies install করো
npm install

# চালাও
npm run dev
```

তারপর browser-এ যাও: http://localhost:3000

---

## Features
- 🎾⚽🏏 Tennis, Football, Cricket বিশ্লেষণ
- 🔄 Rollover সুপারিশ সহ প্রতিটি ম্যাচ রিপোর্ট
- 🏆 Safe Accumulator Builder (২-odd combo)
- 💰 Bankroll Manager + Kelly Criterion
- 📊 Rollover Progress Tracker
- 🇧🇩 সম্পূর্ণ বাংলায় রিপোর্ট
