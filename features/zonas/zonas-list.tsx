"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, EmptyState, Skeleton } from "@gestionresidencial/shared-ui";
import { useAuth } from "@/features/auth/auth-provider";
import { listZonas, setZonaActivacion } from "@/lib/booking-client";
import type { ZonaComun } from "@/lib/types";

export function ZonasList() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes("ADMINISTRACION") ?? false;
  const [zonas, setZonas] = useState<ZonaComun[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    listZonas(isAdmin)
      .then((result) => {
        if (active) {
          setZonas(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [isAdmin]);

  async function toggleActivacion(zona: ZonaComun) {
    setPendingId(zona.id);
    try {
      const actualizada = await setZonaActivacion(zona.id, !zona.activa);
      setZonas((previous) => previous.map((item) => (item.id === zona.id ? actualizada : item)));
    } finally {
      setPendingId(null);
    }
  }

  if (status === "loading") return <Skeleton label="Cargando zonas comunes" />;

  if (status === "error") {
    return (
      <EmptyState title="No pudimos cargar las zonas" description="Comprueba tu conexión e inténtalo de nuevo." />
    );
  }

  if (zonas.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay zonas comunes configuradas"
        description={isAdmin ? "Crea la primera zona para empezar a recibir reservas." : "La administración aún no ha configurado ninguna zona."}
      >
        {isAdmin && (
          <Link href="/admin/zonas/nueva" className="gr-button gr-button--primary">
            Nueva zona
          </Link>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      {isAdmin && (
        <div className="gr-form-actions">
          <Link href="/admin/zonas/nueva" className="gr-button gr-button--primary">
            Nueva zona
          </Link>
        </div>
      )}
      <div className="gr-zona-grid">
        {zonas.map((zona) => (
          <Card key={zona.id} className={zona.activa ? undefined : "gr-zona-inactiva"}>
            <h3>{zona.nombre}</h3>
            {zona.descripcion && <p>{zona.descripcion}</p>}
            <div className="gr-zona-meta">
              <span>
                {zona.horaApertura.slice(0, 5)} – {zona.horaCierre.slice(0, 5)}
              </span>
              <span>Aforo {zona.aforo}</span>
              {!zona.activa && <span>Inactiva</span>}
            </div>
            <div className="gr-publicacion-actions">
              <Link href={`/zonas/${zona.id}`} className="gr-button gr-button--secondary">
                Ver disponibilidad
              </Link>
              {isAdmin && (
                <>
                  <Link href={`/admin/zonas/${zona.id}/editar`} className="gr-button gr-button--secondary">
                    Editar
                  </Link>
                  <Link href={`/admin/zonas/${zona.id}/bloqueos`} className="gr-button gr-button--secondary">
                    Bloqueos
                  </Link>
                  <Button
                    variant="ghost"
                    disabled={pendingId === zona.id}
                    onClick={() => toggleActivacion(zona)}
                  >
                    {zona.activa ? "Desactivar" : "Activar"}
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
