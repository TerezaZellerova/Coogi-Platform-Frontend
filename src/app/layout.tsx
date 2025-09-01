import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import BackendKeepAlive from "@/components/BackendKeepAlive";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coogi - Lead Generation Dashboard",
  description: "AI-powered lead generation and campaign management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('coogi-theme') || 'system';
                const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.add(isDark ? 'dark' : 'light');
                document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
          storageKey="coogi-theme"
        >
          <AuthProvider>
            <BackendKeepAlive />
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
