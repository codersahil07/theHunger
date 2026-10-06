import type { Metadata } from "next";
import { Playfair_Display, Inter, Caveat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "The Hunger | Premium Restaurant Portal",
  description: "Ultra-Premium Modern Indian Restaurant Commerce Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${caveat.variable}`}>
      <body>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#1c140f',
            color: '#fff',
            border: '1px solid rgba(212, 175, 55, 0.4)'
          },
          success: {
            iconTheme: {
              primary: '#d4af37',
              secondary: '#1c140f',
            },
          },
        }} />
        {children}
      </body>
    </html>
  );
}
