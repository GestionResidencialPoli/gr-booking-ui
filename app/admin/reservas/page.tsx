import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { ReservasAdminList } from "@/features/reservas/reservas-admin-list";

export default function ReservasAdminPage() {
  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">Zonas comunes</span>
        <h1>Todas las reservas</h1>
      </div>
      <ReservasAdminList />
    </AuthenticatedShell>
  );
}
