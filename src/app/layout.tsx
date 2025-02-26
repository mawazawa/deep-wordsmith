import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { GlobalErrorBoundary } from "@/lib/error-handling/error-boundaries";
import { ErrorProvider } from "@/context/error-context";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deep Words | Visual Linguistic Exploration",
  description: "Explore language with AI-powered visual mnemonics and contextual understanding",
  keywords: "thesaurus, ai, language tool, visual mnemonics, writing assistant",
  authors: [{ name: "Deep Words Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          robotoMono.variable,
          "antialiased min-h-screen bg-background"
        )}
      >
        <ErrorProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <GlobalErrorBoundary>
              {children}
              <Toaster position="bottom-right" />
            </GlobalErrorBoundary>
          </ThemeProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
