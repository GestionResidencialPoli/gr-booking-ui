"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, EmptyState, Feedback, Skeleton } from "@gestionresidencial/shared-ui";
import { cancelarReservaPropia, misReservas } from "@/lib/booking-client";
import { errorMessage } from "@/lib/error-message";
import type { MisReservas, Reserva } from "@/lib/types";

function formatFechaHora(reserva: Reserva): string {
  const fecha = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long" }).format(
    new Date(`${reserva.fecha}T00:00:00`),
  );
  return `${fecha}, ${reserva.horaInicio}–${reserva.horaFin}`;
}

export function MisReservasList() {
  const [datos, setDatos] = useState<MisReservas | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;

    misReservas()
      .then((result) => {
        if (active) {
          setDatos(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  async function cancelar(reserva: Reserva) {
    setPendingId(reserva.id);
    setError(undefined);
    try {
      const actualizada = await cancelarReservaPropia(reserva.id);
      setDatos((previous) =>
        previous
          ? {
              ...previous,
              proximas: previous.proximas.map((item) => (item.id === reserva.id ? actualizada : item)),
            }
          : previous,
      );
    } catch (caughtError) {
      setError(errorMessage(caughtError, "No se pudo cancelar la reserva."));
    } finally {
      setPendingId(null);
    }
  }

  if (status === "loading") return <Skeleton label="Cargando tus reservas" />;

  if (status === "error" || !datos) {
    return (
      <EmptyState title="No pudimos cargar tus reservas" description="Comprueba tu conexión e inténtalo de nuevo." />
    );
  }

  if (datos.proximas.length === 0 && datos.pasadas.length === 0) {
    return (
      <EmptyState title="Todavía no tienes reservas" description="Explora las zonas comunes y reserva un espacio.">
        <Link href="/" className="gr-button gr-button--primary">
          Ver zonas comunes
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="gr-reserva-listas">
      {error && <Feedback error>{error}</Feedback>}

      <section>
        <h2>Próximas</h2>
        {datos.proximas.length === 0 ? (
          <p>No tienes reservas próximas.</p>
        ) : (
          <ul className="gr-reserva-list">
            {datos.proximas.map((reserva) => (
              <li key={reserva.id} className="gr-reserva-item">
                <div>
                  <strong>{reserva.zona.nombre ?? "Zona común"}</strong>
                  <span>{formatFechaHora(reserva)}</span>
                  <span>{reserva.estado === "CANCELADA" ? "Cancelada" : "Confirmada"}</span>
                </div>
                {reserva.estado === "CONFIRMADA" && (
                  <Button variant="ghost" disabled={pendingId === reserva.id} onClick={() => cancelar(reserva)}>
                    Cancelar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Pasadas</h2>
        {datos.pasadas.length === 0 ? (
          <p>No tienes reservas pasadas.</p>
        ) : (
          <ul className="gr-reserva-list">
            {datos.pasadas.map((reserva) => (
              <li key={reserva.id} className="gr-reserva-item">
                <div>
                  <strong>{reserva.zona.nombre ?? "Zona común"}</strong>
                  <span>{formatFechaHora(reserva)}</span>
                  <span>{reserva.estado === "CANCELADA" ? "Cancelada" : "Confirmada"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
