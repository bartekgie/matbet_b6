import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
})

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.matbet.com.pl'),
  icons: { icon: '/favicon.png' },
  title: {
    default: 'Matbet Deweloper – Osiedle Nowe Miasto Słupsk',
    template: '%s | Matbet',
  },
  description: 'Matbet – deweloper mieszkaniowy ze Słupska. Nowe mieszkania na sprzedaż w Osiedlu Nowe Miasto. Sprawdź dostępne lokale i skontaktuj się z nami.',
  keywords: ['mieszkania Słupsk', 'nowe mieszkania Słupsk', 'deweloper Słupsk', 'Matbet', 'Osiedle Nowe Miasto Słupsk', 'lokale na sprzedaż Słupsk'],
  authors: [{ name: 'Matbet sp. z o.o.' }],
  robots: { index: true, follow: true },
  openGraph: {
    locale: 'pl_PL',
    type: 'website',
    siteName: 'Matbet Deweloper',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
