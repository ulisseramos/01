import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html style={{ height: '100%', width: '100%', background: '#020204' }}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22C55E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EE" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body style={{
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        background: '#020204',
        boxShadow: 'none',
        border: 'none',
        outline: 'none',
        overflowX: 'hidden',
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 