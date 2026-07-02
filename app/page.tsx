import CentrosClient from "@/components/CentrosClient";
import { getCentros } from "@/lib/api/centros";

export default async function HomePage() {
  const { data: centros } = await getCentros();
  return <CentrosClient initialCentros={centros} />;
}
