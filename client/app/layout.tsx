import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignedOut,
  SignedIn,
  SignUpButton,
  SignInButton,
} from "@clerk/nextjs";
import "./globals.css";
import Navbar from "./components/navbar"; // ✅ import your navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarif AI",
  description: "AI-powered PDF assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
        >
          {/* If not signed in → show auth buttons */}
         <SignedOut>
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4 px-4">
    {/* Navbar only for signed out */}
    <div className="w-full">
      <Navbar />
    </div>

    <h1 className="text-xl sm:text-2xl font-bold text-purple-400 text-center">
      Clarif AI
    </h1>
    <p className="text-gray-400 text-sm sm:text-base text-center">
      Sign in to continue
    </p>
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
      <SignInButton mode="modal">
        <button className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm sm:text-base">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-purple-700 rounded-lg hover:bg-purple-800 text-sm sm:text-base">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  </div>
</SignedOut>

          {/* If signed in → show navbar + app */}
          <SignedIn>
            {/* ✅ Navbar sits above everything and doesn’t overlap */}
            <div className="sticky top-0 z-50">
              <Navbar />
            </div>

            {/* ✅ main content comes below navbar */}
            <main className="pt-20">{children}</main>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
