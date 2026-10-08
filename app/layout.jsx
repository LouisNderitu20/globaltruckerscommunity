import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';

export const metadata = {
  title: 'Global Truckers Community – ETS 2 & ATS Virtual Convoys',
  description: 'Global Truckers Community (GTC): a worldwide community of ETS 2 and ATS truckers and streamers from many VTCs and independent players.',
  metadataBase: new URL('https://globaltruckerscommunity.vercel.app'),
  openGraph: {
    title: 'Global Truckers Community (GTC)',
    description: 'ETS 2 and ATS virtual convoys for truckers and streamers from every VTC and independent players, worldwide.',
    url: 'https://globaltruckerscommunity.vercel.app',
    siteName: 'Global Truckers Community',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Global Truckers Community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/apple-touch-icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
