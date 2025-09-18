import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  ClerkProvider,
  SignedOut,
  SignInButton,
  SignedIn,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ClarifAI - Intelligent Solutions',
  description: 'AI-powered platform for intelligent solutions and insights',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#8b5cf6',
          colorText: '#f8fafc',
          colorBackground: '#0f172a',
          colorInputBackground: '#1e293b',
          colorInputText: '#f8fafc',
        },
        elements: {
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-sm normal-case',
          card: 'bg-slate-900 shadow-xl border border-slate-800 rounded-xl',
          formFieldInput: 'bg-slate-800 border-slate-700 text-white',
          footerActionLink: 'text-purple-400 hover:text-purple-300',
          socialButtonsBlockButton: 'bg-slate-800 border-slate-700 text-white',
          formFieldLabel: 'text-slate-300',
          formHeaderTitle: 'text-white',
          formHeaderSubtitle: 'text-slate-400',
          dividerLine: 'bg-slate-700',
          dividerText: 'text-slate-400',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-purple-400',
        },
      }}
    >
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased 
            bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900 text-slate-100 min-h-screen`}
        >
          <header className="w-full py-4 px-6 absolute top-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  ClarifAI
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <SignedIn>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                        userButtonPopoverCard: "bg-slate-900 border-slate-800",
                        userButtonPopoverActionButtonText: "text-slate-200",
                        userButtonPopoverActionButton: "hover:bg-slate-800",
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </header>

          <main className="flex flex-col justify-center items-center min-h-screen px-4 py-16">
            <SignedOut>
              <div className="max-w-md w-full mx-auto text-center space-y-8 p-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Welcome to ClarifAI
                  </h1>
                  <p className="text-slate-400">
                    Sign in to access AI-powered insights and solutions
                  </p>
                </div>
                
                <div className="flex flex-col space-y-3">
                  {/* Fixed: Using routing and path props instead of URL props */}
                  <SignUpButton mode="modal">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium">
                      Get Started
                    </button>
                  </SignUpButton>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900/80 text-slate-500">Or</span>
                    </div>
                  </div>
                  
                  <SignInButton mode="modal">
                    <button className="w-full px-6 py-3 bg-slate-800 text-slate-200 rounded-xl shadow-md border border-slate-700 hover:bg-slate-750 transition-all duration-200 font-medium">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
                
                <p className="text-xs text-slate-500 pt-4">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </SignedOut>
            
            <SignedIn>
              <div className="w-full max-w-6xl mx-auto">
                {children}
              </div>
            </SignedIn>
          </main>
          
          <footer className="w-full py-6 px-6 border-t border-slate-800 bg-slate-900/50">
            <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
              <p>© {new Date().getFullYear()} ClarifAI. All rights reserved.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}