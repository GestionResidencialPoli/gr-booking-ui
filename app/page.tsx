import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { ZonasList } from "@/features/zonas/zonas-list";

export default function ZonasPage() {
  return (
    <AuthenticatedShell>
      <div className="page-heading">
        <span className="gr-eyebrow">Zonas comunes</span>
        <h1>Reserva un espacio</h1>
        <p>Consulta la disponibilidad y reserva la zona común que necesites.</p>
      </div>
      <ZonasList />
    </AuthenticatedShell>
  );
}
