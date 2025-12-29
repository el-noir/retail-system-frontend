import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ReduxProvider } from "@/lib/store/ReduxProvider";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Store Master",
  description: "Inventory and Sales Management System",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}>
        <ErrorBoundary>
          <ReduxProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="min-h-screen">
                  <Navbar />
                  <main>{children}</main>
                </div>
              </ToastProvider>
            </AuthProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
