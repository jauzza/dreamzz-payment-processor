import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { V0Provider } from "@/lib/context"
import dynamic from "next/dynamic"

const V0Setup = dynamic(() => import("@/components/v0-setup"))

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
})

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false

export const metadata: Metadata = {
  title: {
    template: "%s | dreamzz",
    default: "dreamzz - Premium NSFW Community",
  },
  description:
    "Step into the hottest NSFW community online. Unlock exclusive content, premium drops, and the best OnlyFans leaks. Join 1,000+ members now!",
  keywords: ["dreamzz", "premium", "NSFW", "community", "exclusive content", "OnlyFans"],
  authors: [{ name: "dreamzz" }],
  creator: "dreamzz",
  publisher: "dreamzz",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dreamzz.lol',
    siteName: 'dreamzz',
    title: 'dreamzz - Premium NSFW Community',
    description: 'Step into the hottest NSFW community online. Unlock exclusive content, premium drops, and the best OnlyFans leaks. Join 1,000+ members now!',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'dreamzz - Premium NSFW Community',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dreamzz - Premium NSFW Community',
    description: 'Step into the hottest NSFW community online. Unlock exclusive content, premium drops, and the best OnlyFans leaks.',
    images: ['/opengraph-image.png'],
    creator: '@Dreammzzzzzz',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(geistSans.variable, geistMono.variable, instrumentSerif.variable)}>
        <V0Provider isV0={isV0}>
          {children}
          {isV0 && <V0Setup />}
        </V0Provider>
      </body>
    </html>
  )
}
