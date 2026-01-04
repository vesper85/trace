import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletProvider, QueryProvider } from "./providers";
import { AppSidebar } from "./components";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Movement Developer Tools",
  description: "Transaction simulator and developer tools for Movement L1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            <WalletProvider>
              <div className="flex min-h-screen">
                {/* Sidebar - fixed width */}
                <aside className="w-64 flex-shrink-0 border-r bg-card">
                  <AppSidebar />
                </aside>
                {/* Main content - fills remaining space */}
                <main className="flex-1 min-w-0 bg-background">
                  {children}
                </main>
              </div>
            </WalletProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
