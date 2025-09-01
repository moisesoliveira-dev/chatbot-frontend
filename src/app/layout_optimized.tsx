import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { KeyboardShortcutsProvider } from '@/components/ui/KeyboardShortcuts';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        template: '%s | ChatBot Admin',
        default: 'ChatBot Admin - Sistema de Gerenciamento'
    },
    description: 'Sistema administrativo completo para gerenciamento de chatbot inteligente',
    keywords: ['chatbot', 'admin', 'dashboard', 'conversas', 'templates', 'analytics'],
    authors: [{ name: 'ChatBot Team' }],
    creator: 'ChatBot Team',
    publisher: 'ChatBot Admin',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://chatbot-admin.vercel.app'),
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: 'https://chatbot-admin.vercel.app',
        title: 'ChatBot Admin - Sistema de Gerenciamento',
        description: 'Sistema administrativo completo para gerenciamento de chatbot inteligente',
        siteName: 'ChatBot Admin',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ChatBot Admin - Sistema de Gerenciamento',
        description: 'Sistema administrativo completo para gerenciamento de chatbot inteligente',
    },
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#3b82f6" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="ChatBot Admin" />
                <meta name="application-name" content="ChatBot Admin" />
                <meta name="msapplication-TileColor" content="#3b82f6" />
                <meta name="msapplication-config" content="/browserconfig.xml" />

                {/* Preload critical resources */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Security headers */}
                <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
                <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
                <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
            </head>
            <body className={`${inter.className} antialiased`}>
                <ErrorBoundary>
                    <ThemeProvider defaultTheme="system">
                        <AccessibilityProvider>
                            <KeyboardShortcutsProvider>
                                {/* Skip to main content for accessibility */}
                                <a
                                    href="#main-content"
                                    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:no-underline"
                                >
                                    Pular para o conteúdo principal
                                </a>

                                <div id="root" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                                    <main id="main-content">
                                        {children}
                                    </main>
                                </div>
                            </KeyboardShortcutsProvider>
                        </AccessibilityProvider>
                    </ThemeProvider>
                </ErrorBoundary>

                {/* Service Worker Registration */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
                    }}
                />
            </body>
        </html>
    );
}
