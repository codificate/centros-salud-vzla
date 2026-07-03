import type { Metadata } from "next";
import AboutUsScreen from "@/components/AboutUsScreen";

export const metadata: Metadata = {
  title: "Acerca de - Centros de Salud",
  description: "Quiénes somos y por qué construimos el directorio de centros de salud de Venezuela.",
};

export default function AcercaPage() {
  return <AboutUsScreen />;
}
