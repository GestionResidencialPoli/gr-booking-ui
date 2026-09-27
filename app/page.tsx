import { EmptyState } from "@gestionresidencial/shared-ui";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";

export default function ZonasPage() {
  return (
    <AuthenticatedShell>
      <EmptyState title="Zonas comunes" description="Próximamente." />
    </AuthenticatedShell>
  );
}
