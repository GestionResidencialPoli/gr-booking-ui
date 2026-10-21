"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, Skeleton } from "@gestionresidencial/shared-ui";
import { getZona, updateZona } from "@/lib/booking-client";
import type { ZonaComun } from "@/lib/types";
import { ZonaForm } from "./zona-form";

export function EditarZona({ id }: { id: number }) {
  const router = useRouter();
  const [zona, setZona] = useState<ZonaComun | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    getZona(id)
      .then((result) => {
        if (active) {
          setZona(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(input: Parameters<typeof updateZona>[1]) {
    await updateZona(id, input);
    router.push("/");
  }

  if (status === "loading") return <Skeleton label="Cargando zona" />;

  if (status === "error" || !zona) {
    return <EmptyState title="No pudimos cargar esta zona" description="Comprueba tu conexión e inténtalo de nuevo." />;
  }

  return <ZonaForm initial={zona} onSubmit={handleSubmit} submitLabel="Guardar cambios" pendingLabel="Guardando…" />;
}
