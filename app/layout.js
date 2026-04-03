import './globals.css'

export const metadata = {
  title: 'NEF — Sports Analyser',
  description: 'Narrative Engine Framework for Sports Analysis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  )
}
