import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <title>Readit</title>
          <link rel='shortcut icon' href='/favicon.png' type='image/x-icon' />
          <meta property='og:site_name' content='Reflex' />
          <meta property='og:type' content='website' />
          <meta
            property='og:image'
            content={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/favicon.png`}
          />
          <meta
            property='twitter:image'
            content={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/favicon.png`}
          />
          <meta property='twitter:card' content='summary' />
          {/* FONT-AWESOME */}
          <link
            rel='stylesheet'
            href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
          />
          {/* IMB PLEX FONT */}
          <link rel='preconnect' href='https://fonts.gstatic.com' />
          <link
            href='https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;200;300;400;500;600&display=swap'
            rel='stylesheet'
          />
        </Head>
        <body className='font-body' style={{ backgroundColor: '#DAE0E6' }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
