import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { MisReservasList } from "@/features/reservas/mis-reservas-list";

export default function MisReservasPage() {
  return (
    <AuthenticatedShell requiredRole="RESIDENTE">
      <div className="page-heading">
        <span className="gr-eyebrow">Zonas comunes</span>
        <h1>Mis reservas</h1>
      </div>
      <MisReservasList />
    </AuthenticatedShell>
  );
}
