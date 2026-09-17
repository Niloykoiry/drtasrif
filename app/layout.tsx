import type { Metadata } from "next";
import { Caveat, Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const script = Caveat({ subsets: ["latin"], variable: "--font-script", display: "swap" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali", display: "swap" });

export const metadata: Metadata = {
  title: "Dr. Tasrif Ahmed | Maxillofacial & Oral Cancer Surgeon, Dhaka",
  description:
    "Official portfolio of Dr. Tasrif Ahmed, Maxillofacial & Oral Cancer Surgeon in Dhaka, Bangladesh. Compassionate care, advanced treatment and better outcomes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${script.variable} ${bengali.variable}`}>
      <body className="font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
