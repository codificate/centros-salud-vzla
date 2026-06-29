import CentrosClient from "@/components/CentrosClient";
import { centros } from "@/lib/centros";

export default function HomePage() {
  return <CentrosClient centros={centros} />;
}
