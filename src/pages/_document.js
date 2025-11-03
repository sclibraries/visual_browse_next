import { Html, Head, Main, NextScript } from 'next/document'

 
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="description" content="Visual Browse - Discover and explore library collections through an intuitive visual interface" />
        <meta name="keywords" content="library, browse, visual, collections, search, books, materials, catalog" />
        <meta name="author" content="Visual Browse" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph Meta Tags for Social Media */}
        <meta property="og:title" content="Visual Browse" />
        <meta property="og:description" content="Discover and explore library collections through an intuitive visual interface" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Visual Browse" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Visual Browse" />
        <meta name="twitter:description" content="Discover and explore library collections through an intuitive visual interface" />
        
        {/* Theme and Application Meta Tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="application-name" content="Visual Browse" />
        
        {/* Favicon and Icon Links */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}