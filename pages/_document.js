import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta property="og:title" content="Movie-Wizard" key="title"/>
        <meta property="og:description" content="Let AI pick the perfect movie for you - simply enter your prompt and press generate" key="description"/>
        <meta
          property="og:image"
          content="https://moviewhiz.xyz/moviewhiz-og.jpg"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://moviewhiz.xyz" />
        <meta name="twitter:card" content="summary_large_image"></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
