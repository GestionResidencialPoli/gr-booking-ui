import { notFound } from "next/navigation";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { EditarZona } from "@/features/zonas/editar-zona";

export default async function EditarZonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">Zonas comunes</span>
        <h1>Editar zona</h1>
      </div>
      <EditarZona id={numericId} />
    </AuthenticatedShell>
  );
}
