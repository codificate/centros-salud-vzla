import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SignUpFlowProvider } from "@/components/providers/SignUpFlowProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Centros de Salud - Venezuela",
  description: "Listado de centros de salud en Venezuela",
};

// Google Sans (Google branding for the "Sign in with Google" button).
const GOOGLE_SANS_HREF =
  "https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={GOOGLE_SANS_HREF} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <AnalyticsProvider>
            <SignUpFlowProvider>{children}</SignUpFlowProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
