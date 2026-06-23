import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";

const BASE_URL = "https://classflow-prime.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "ClassFlow Prime | Scalable Education Management Platform",
    template: "%s | ClassFlow Prime",
  },
  description:
    "ClassFlow Prime is a scalable education management platform designed to centralize class operations, communication, exams, and member management into a digital workspace.",
  verification: {
    google: "wX9p5QSBg-V35tiEQef35nhxekmLe0tuCjPcXo04Yxo",
  },
  keywords: [
    "ClassFlow Prime",
    "Education Management System",
    "Academic Management",
    "Class Updates",
    "Exam Schedules",
  ],
  authors: [{ name: "Tarikul Islam", url: "https://tarikul-islam.me" }],
  creator: "Tarikul Islam",
  publisher: "Tarikul Islam",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "ClassFlow Prime",
    title: "Smart Education Management Platform",
    description:
      "Centralize classes, exams, communication & collaboration in one powerful academic workspace.",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "ClassFlow Prime Modern Dashboard Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ClassFlow Prime",
    description:
      "A modern education management system for students & institutions.",
    images: ["/og"],
  },

  // ── PWA & Icons ──
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClassFlow Prime",
  },
  // ── Icons (matched to actual /public files) ──
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon0.svg", type: "image/svg+xml" },   // scalable
      { url: "/icon1.png", type: "image/png", sizes: "48x48" },
    ],
    apple: "/apple-icon.png",                          // exists in public ✓
    other: [
      { rel: "mask-icon", url: "/icon0.svg", color: "#0a0a0a" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ClassFlow Prime",
    "url": BASE_URL,
    "author": {
      "@type": "Person",
      "name": "Tarikul Islam",
      "url": "https://tarikul-islam.me",
      'sameAs': [
        "https://www.linkedin.com/in/tarik-islam-3639/",
        "https://www.github.com/tarikul3639",
        "https://www.twitter.com/tarikul3639",
      ],
    },
    description: "ClassFlow Prime is a scalable, all-in-one education management platform designed to centralize class operations. From real-time class updates and exam schedules to study group coordination and member management, it provides a structured digital workspace for students and administrators to collaborate efficiently.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
    keywords: [
      "ClassFlow Prime",               // Brand Name
      "Education Management System",   // Main Category
      "Academic Management Platform",  // Broad Keyword
      "Class Updates",                 // Feature Specific
      "Exam Schedules",                // Feature Specific
      "Student Communication Tools",   // Solution Specific
      "Scalable Education Platform",   // Tech Specific
      "Centralized Academic Workspace",// Value Proposition
      "Class Management System",       // Alternative Search Term
    ],
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}