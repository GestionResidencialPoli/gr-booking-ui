import { notFound } from "next/navigation";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { DisponibilidadCalendar } from "@/features/zonas/disponibilidad-calendar";

export default async function ZonaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  return (
    <AuthenticatedShell>
      <DisponibilidadCalendar key={numericId} zonaId={numericId} />
    </AuthenticatedShell>
  );
}
