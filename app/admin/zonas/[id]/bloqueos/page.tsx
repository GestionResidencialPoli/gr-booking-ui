import { notFound } from "next/navigation";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { BloqueosManager } from "@/features/zonas/bloqueos-manager";

export default async function BloqueosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">Zonas comunes</span>
        <h1>Bloqueos por mantenimiento</h1>
      </div>
      <BloqueosManager zonaId={numericId} />
    </AuthenticatedShell>
  );
}
