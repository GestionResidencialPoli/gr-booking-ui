"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, EmptyState, Feedback, Skeleton } from "@gestionresidencial/shared-ui";
import { crearReserva, getDisponibilidad, getZona } from "@/lib/booking-client";
import { errorCode, errorMessage } from "@/lib/error-message";
import type { Disponibilidad, FranjaDisponibilidad, ZonaComun } from "@/lib/types";
import { estadoFranjaClass, estadoFranjaLabel, franjaSeleccionable } from "./estado-franja-badge";

const DIAS_VENTANA = 6;

function sumarDias(fecha: string, dias: number): string {
  const base = new Date(`${fecha}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

function hoyLocal(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFecha(fecha: string): string {
  return new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(`${fecha}T00:00:00`),
  );
}

export function DisponibilidadCalendar({ zonaId }: { zonaId: number }) {
  const [desde, setDesde] = useState(hoyLocal());
  const [attempt, setAttempt] = useState(0);

  return (
    <DisponibilidadWindow
      key={`${desde}-${attempt}`}
      zonaId={zonaId}
      desde={desde}
      onAnterior={() => setDesde((current) => sumarDias(current, -DIAS_VENTANA))}
      onSiguiente={() => setDesde((current) => sumarDias(current, DIAS_VENTANA))}
      onRetry={() => setAttempt((current) => current + 1)}
    />
  );
}

function DisponibilidadWindow({
  zonaId,
  desde,
  onAnterior,
  onSiguiente,
  onRetry,
}: {
  zonaId: number;
  desde: string;
  onAnterior: () => void;
  onSiguiente: () => void;
  onRetry: () => void;
}) {
  const [zona, setZona] = useState<ZonaComun | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [seleccion, setSeleccion] = useState<{ fecha: string; franja: FranjaDisponibilidad } | null>(null);
  const [reservando, setReservando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string>();
  const [confirmada, setConfirmada] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([getZona(zonaId), getDisponibilidad(zonaId, desde, sumarDias(desde, DIAS_VENTANA))])
      .then(([zonaResult, disponibilidadResult]) => {
        if (!active) return;
        setZona(zonaResult);
        setDisponibilidad(disponibilidadResult);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  async function confirmar() {
    if (!seleccion || reservando) return;
    setReservando(true);
    setMensajeError(undefined);

    try {
      await crearReserva({ zonaId, fecha: seleccion.fecha, horaInicio: seleccion.franja.horaInicio });
      setConfirmada(true);
      setSeleccion(null);
    } catch (error) {
      setMensajeError(
        errorCode(error) === "FRANJA_SIN_CUPO"
          ? errorMessage(error, "Esta franja ya no está disponible.")
          : errorMessage(error, "No se pudo confirmar la reserva."),
      );
      if (errorCode(error) === "FRANJA_SIN_CUPO") onRetry();
    } finally {
      setReservando(false);
    }
  }

  if (status === "loading") return <Skeleton label="Cargando disponibilidad" />;

  if (status === "error" || !zona || !disponibilidad) {
    return (
      <EmptyState title="No pudimos cargar la disponibilidad" description="Comprueba tu conexión e inténtalo de nuevo.">
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      </EmptyState>
    );
  }

  if (confirmada) {
    return (
      <EmptyState title="Reserva confirmada" description={`Tu reserva en ${zona.nombre} quedó confirmada.`}>
        <Link href="/mis-reservas" className="gr-button gr-button--primary">
          Ver mis reservas
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="gr-calendario">
      <div className="page-heading">
        <h1>{zona.nombre}</h1>
        {zona.descripcion && <p>{zona.descripcion}</p>}
      </div>

      <div className="gr-calendario-nav">
        <Button variant="secondary" onClick={onAnterior}>
          ← Semana anterior
        </Button>
        <Button variant="secondary" onClick={onSiguiente}>
          Semana siguiente →
        </Button>
      </div>

      <div className="gr-calendario-dias">
        {disponibilidad.dias.map((dia) => (
          <div key={dia.fecha} className="gr-calendario-dia">
            <h3>{formatFecha(dia.fecha)}</h3>
            <div className="gr-franja-grid">
              {dia.franjas.map((franja) => (
                <button
                  key={franja.inicio}
                  type="button"
                  className={estadoFranjaClass(franja.estado)}
                  disabled={!franjaSeleccionable(franja.estado)}
                  aria-pressed={seleccion?.franja.inicio === franja.inicio}
                  onClick={() => setSeleccion({ fecha: dia.fecha, franja })}
                >
                  <strong>
                    {franja.horaInicio}–{franja.horaFin}
                  </strong>
                  <span>
                    {franja.motivoBloqueo ?? estadoFranjaLabel(franja.estado)}
                    {franja.estado === "PARCIAL" && ` · ${franja.cuposRestantes} cupo(s)`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {seleccion && (
        <div className="gr-reserva-confirm">
          <p>
            Reservar <strong>{zona.nombre}</strong> el {formatFecha(seleccion.fecha)} de{" "}
            {seleccion.franja.horaInicio} a {seleccion.franja.horaFin}.
          </p>
          {mensajeError && <Feedback error>{mensajeError}</Feedback>}
          <div className="gr-form-actions">
            <Button disabled={reservando} onClick={confirmar}>
              {reservando ? "Confirmando…" : "Confirmar reserva"}
            </Button>
            <Button variant="ghost" disabled={reservando} onClick={() => setSeleccion(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
