import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SignUpFlowProvider } from "@/components/providers/SignUpFlowProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Centros de Salud - Venezuela",
  description: "Listado de centros de salud en Venezuela",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
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
