import { apiFetch } from "@gestionresidencial/auth-client";
import type {
  Bloqueo,
  Disponibilidad,
  EstadoReserva,
  MisReservas,
  PageResult,
  Reserva,
  ZonaComun,
  ZonaComunInput,
} from "./types";

const ZONAS_PATH = "/api/v1/zonas-comunes";
const RESERVAS_PATH = "/api/v1/reservas";

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export async function listZonas(incluirInactivas = false): Promise<ZonaComun[]> {
  const { payload } = await apiFetch<{ payload: ZonaComun[] }>(
    `${ZONAS_PATH}${query({ incluirInactivas })}`,
  );
  return payload;
}

export async function getZona(id: number): Promise<ZonaComun> {
  const { payload } = await apiFetch<{ payload: ZonaComun }>(`${ZONAS_PATH}/${id}`);
  return payload;
}

export async function getDisponibilidad(id: number, desde?: string, hasta?: string): Promise<Disponibilidad> {
  const { payload } = await apiFetch<{ payload: Disponibilidad }>(
    `${ZONAS_PATH}/${id}/disponibilidad${query({ desde, hasta })}`,
  );
  return payload;
}

export async function createZona(input: ZonaComunInput): Promise<ZonaComun> {
  const { payload } = await apiFetch<{ payload: ZonaComun }>(ZONAS_PATH, { method: "POST", body: input });
  return payload;
}

export async function updateZona(id: number, input: ZonaComunInput): Promise<ZonaComun> {
  const { payload } = await apiFetch<{ payload: ZonaComun }>(`${ZONAS_PATH}/${id}`, {
    method: "PUT",
    body: input,
  });
  return payload;
}

export async function setZonaActivacion(id: number, activa: boolean): Promise<ZonaComun> {
  const { payload } = await apiFetch<{ payload: ZonaComun }>(`${ZONAS_PATH}/${id}/activacion`, {
    method: "PATCH",
    body: { activa },
  });
  return payload;
}

export async function listBloqueos(zonaId: number): Promise<Bloqueo[]> {
  const { payload } = await apiFetch<{ payload: Bloqueo[] }>(`${ZONAS_PATH}/${zonaId}/bloqueos`);
  return payload;
}

export async function reservasAfectadasPorBloqueo(
  zonaId: number,
  inicio: string,
  fin: string,
): Promise<Reserva[]> {
  const { payload } = await apiFetch<{ payload: Reserva[] }>(
    `${ZONAS_PATH}/${zonaId}/bloqueos/reservas-afectadas${query({ inicio, fin })}`,
  );
  return payload;
}

export async function createBloqueo(
  zonaId: number,
  input: { inicio: string; fin: string; motivo: string; cancelarReservasAfectadas: boolean },
): Promise<Bloqueo> {
  const { payload } = await apiFetch<{ payload: Bloqueo }>(`${ZONAS_PATH}/${zonaId}/bloqueos`, {
    method: "POST",
    body: input,
  });
  return payload;
}

export async function deleteBloqueo(zonaId: number, bloqueoId: number): Promise<void> {
  await apiFetch(`${ZONAS_PATH}/${zonaId}/bloqueos/${bloqueoId}`, { method: "DELETE" });
}

export async function crearReserva(input: {
  zonaId: number;
  fecha: string;
  horaInicio: string;
}): Promise<Reserva> {
  const { payload } = await apiFetch<{ payload: Reserva }>(RESERVAS_PATH, { method: "POST", body: input });
  return payload;
}

export async function misReservas(): Promise<MisReservas> {
  const { payload } = await apiFetch<{ payload: MisReservas }>(`${RESERVAS_PATH}/mias`);
  return payload;
}

export async function cancelarReservaPropia(id: number): Promise<Reserva> {
  const { payload } = await apiFetch<{ payload: Reserva }>(`${RESERVAS_PATH}/${id}/cancelacion`, {
    method: "PATCH",
  });
  return payload;
}

export async function listReservasAdmin(params: {
  zonaId?: number;
  desde?: string;
  hasta?: string;
  estado?: EstadoReserva;
  page?: number;
  size?: number;
}): Promise<PageResult<Reserva>> {
  const { payload } = await apiFetch<{ payload: PageResult<Reserva> }>(`${RESERVAS_PATH}${query(params)}`);
  return payload;
}

export async function cancelarReservaAdmin(id: number, motivo: string): Promise<Reserva> {
  const { payload } = await apiFetch<{ payload: Reserva }>(`${RESERVAS_PATH}/${id}/cancelacion-administrativa`, {
    method: "PATCH",
    body: { motivo },
  });
  return payload;
}
