import CentrosClient from "@/components/CentrosClient";
import { getCentros } from "@/lib/api/centros";

export default async function HomePage() {
  const centros = await getCentros();
  return <CentrosClient centros={centros} />;
}
