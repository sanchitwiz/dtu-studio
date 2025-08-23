import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Script from "next/script"
import "./globals.css"
import { Providers } from "../components/providers"

export const metadata: Metadata = {
  title: {
    default: "DTU Studio - Photography & Videography Booking System",
    template: "%s | DTU Studio"
  },
  description: "Professional photography and videography studio booking system for DTU college students and faculty. Schedule time slots, book equipment, and manage studio resources efficiently.",
  keywords: ["photography studio", "videography booking", "DTU studio", "college photography", "studio rental", "equipment booking", "video production", "photo studio booking"],
  authors: [{ name: "DTU Studio Team" }],
  creator: "DTU Studio",
  publisher: "Delhi Technological University",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dtu-studio.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dtu-studio.vercel.app",
    title: "DTU Studio - Photography & Videography Booking System",
    description: "Professional photography and videography studio booking system for DTU college students and faculty. Schedule time slots, book equipment, and manage studio resources efficiently.",
    siteName: "DTU Studio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DTU Studio - Photography & Videography Booking System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DTU Studio - Photography & Videography Booking System",
    description: "Professional photography and videography studio booking system for DTU college students and faculty.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  category: "education",
}

// JSON-LD Structured Data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "DTU Studio",
  "description": "Photography and Videography Studio at Delhi Technological University",
  "url": "https://dtu-studio.vercel.app",
  "logo": "https://dtu-studio.vercel.app/logo.png",
  "parentOrganization": {
    "@type": "University",
    "name": "Delhi Technological University",
    "url": "http://dtu.ac.in"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-xxx-xxx-xxxx",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Hindi"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Shahbad Daulatpur, Main Bawana Road",
    "addressLocality": "Delhi",
    "postalCode": "110042",
    "addressCountry": "IN"
  }
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DTU Studio",
  "url": "https://dtu-studio.vercel.app",
  "description": "Professional photography and videography studio booking system",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://dtu-studio.vercel.app/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Studio Booking Service",
  "description": "Professional photography and videography studio booking and scheduling service",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "DTU Studio"
  },
  "serviceType": "Photography and Videography Studio Rental",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://dtu-studio.vercel.app/schedule",
    "serviceSmsNumber": "+91-xxx-xxx-xxxx"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data - JSON-LD */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <Script
          id="service-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />
        
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        
        {/* Analytics - Add your tracking IDs */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_TRACKING_ID');
          `}
        </Script>
      </body>
    </html>
  )
}
