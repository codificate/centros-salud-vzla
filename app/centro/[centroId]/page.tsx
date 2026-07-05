import { notFound } from "next/navigation";
import { getCentros } from "@/lib/api/centros";
import CentroDetailScreen from "@/components/CentroDetailScreen";

export default async function CentroPage({
  params,
}: {
  params: { centroId: string };
}) {
  const centroId = Number(params.centroId);
  if (!Number.isInteger(centroId) || centroId <= 0) notFound();

  const { data } = await getCentros();
  const centro = data.find((c) => c.id === centroId);
  if (!centro) notFound();

  return <CentroDetailScreen centro={centro} />;
}
