"use client";

import { useRouter } from "next/navigation";
import { createZona } from "@/lib/booking-client";
import { ZonaForm } from "./zona-form";

export function CrearZona() {
  const router = useRouter();

  async function handleSubmit(input: Parameters<typeof createZona>[0]) {
    await createZona(input);
    router.push("/");
  }

  return <ZonaForm onSubmit={handleSubmit} submitLabel="Crear zona" pendingLabel="Creando…" />;
}
