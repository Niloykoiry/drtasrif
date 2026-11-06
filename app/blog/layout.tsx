import { LanguageProvider } from "@/lib/i18n";

export default function BlogLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
