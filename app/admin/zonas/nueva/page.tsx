import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { CrearZona } from "@/features/zonas/crear-zona";

export default function NuevaZonaPage() {
  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">Zonas comunes</span>
        <h1>Nueva zona</h1>
      </div>
      <CrearZona />
    </AuthenticatedShell>
  );
}
