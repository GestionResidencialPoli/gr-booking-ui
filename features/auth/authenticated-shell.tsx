"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { EmptyState, Feedback, PlatformShell, Skeleton } from "@gestionresidencial/shared-ui";
import { authUiLoginUrl, openPlatformUrl, type Role } from "@gestionresidencial/auth-client";
import { useAuth } from "./auth-provider";

export function AuthenticatedShell({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: Role;
}) {
  const { user, loading, sessionError, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const pathname = usePathname();

  const signingOut = useRef(false);

  useEffect(() => {
    if (!signingOut.current && !loading && !sessionError && !user) {
      window.location.replace(authUiLoginUrl());
    }
  }, [loading, sessionError, user]);

  async function signOut() {
    signingOut.current = true;
    setPending(true);
    setLogoutError(false);
    try {
      await logout();
      const loginUrl = new URL(authUiLoginUrl());
      loginUrl.searchParams.set("logout", "1");
      window.location.replace(loginUrl.toString());
    } catch {
      signingOut.current = false;
      setLogoutError(true);
    } finally {
      setPending(false);
    }
  }

  if (loading || (!sessionError && !user)) {
    return (
      <div className="standalone-state">
        <Skeleton label="Cargando zonas comunes" />
      </div>
    );
  }

  if (sessionError || !user) {
    return (
      <div className="standalone-state">
        <EmptyState
          title="No pudimos verificar tu sesión"
          description="Comprueba que el servicio de usuarios esté disponible e inténtalo de nuevo."
        />
      </div>
    );
  }

  const hasAccess = !requiredRole || user.roles.includes(requiredRole);
  const subNavigation = user.roles.includes("ADMINISTRACION")
    ? [
        { id: "zonas", label: "Zonas", path: "/" },
        { id: "reservas", label: "Todas las reservas", path: "/admin/reservas" },
      ]
    : [
        { id: "zonas", label: "Explorar zonas", path: "/" },
        { id: "mis-reservas", label: "Mis reservas", path: "/mis-reservas" },
      ];

  return (
    <PlatformShell
      app="booking"
      pathname={pathname}
      user={user}
      subNavigation={subNavigation}
      onOpenApp={(url) => void openPlatformUrl(user.roles, url)}
      onLogout={signOut}
      loggingOut={pending}
    >
      {logoutError && <Feedback error>No se pudo cerrar sesión. Inténtalo de nuevo.</Feedback>}
      {hasAccess ? (
        children
      ) : (
        <EmptyState
          title="No tienes acceso a esta sección"
          description="Esta página es solo para el rol de administración."
        />
      )}
    </PlatformShell>
  );
}
