import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'בסוף הכל יהיה בסדר - הרצאות להנצחת תובל ז"ל',
  description: 'הרצאות מעוררות השראה להנצחת זכרו של סמ"ר תובל יעקב צנעני ז"ל - סיפור של גבורה, אחווה ותקווה. רביד צנעני מרצה על אחיו הגיבור',
  keywords: ['תובל צנעני', 'הרצאות השראה', 'זיכרון חללי צה"ל', 'גבורה', 'אחווה', 'רביד צנעני', 'גדוד 53', 'עוצבת ברק'],
  openGraph: {
    title: 'בסוף הכל יהיה בסדר - הרצאות תובל ז"ל',
    description: 'הרצאות מעוררות השראה להנצחת זכרו של סמ"ר תובל יעקב צנעני ז"ל',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
