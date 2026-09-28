"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, EmptyState, Feedback, Skeleton, TextField } from "@gestionresidencial/shared-ui";
import {
  createBloqueo,
  deleteBloqueo,
  listBloqueos,
  reservasAfectadasPorBloqueo,
} from "@/lib/booking-client";
import { errorMessage } from "@/lib/error-message";
import type { Bloqueo, Reserva } from "@/lib/types";

type Revision = { inicio: string; fin: string; motivo: string; afectadas: Reserva[] };

export function BloqueosManager({ zonaId }: { zonaId: number }) {
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [revision, setRevision] = useState<Revision>();
  const [revisando, setRevisando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pendingDeleteId, setPendingDeleteId] = useState<number>();

  useEffect(() => {
    let active = true;
    listBloqueos(zonaId)
      .then((result) => {
        if (active) {
          setBloqueos(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [zonaId]);

  async function revisar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setRevisando(true);

    const data = new FormData(event.currentTarget);
    const inicio = String(data.get("inicio"));
    const fin = String(data.get("fin"));
    const motivo = String(data.get("motivo") || "").trim();

    try {
      const afectadas = await reservasAfectadasPorBloqueo(zonaId, inicio, fin);
      setRevision({ inicio, fin, motivo, afectadas });
    } catch (caughtError) {
      setError(errorMessage(caughtError, "No se pudo revisar el bloqueo."));
    } finally {
      setRevisando(false);
    }
  }

  async function confirmar() {
    if (!revision) return;
    setConfirmando(true);
    setError(undefined);
    try {
      const creado = await createBloqueo(zonaId, {
        inicio: revision.inicio,
        fin: revision.fin,
        motivo: revision.motivo,
        cancelarReservasAfectadas: revision.afectadas.length > 0,
      });
      setBloqueos((previous) => [creado, ...previous]);
      setRevision(undefined);
    } catch (caughtError) {
      setError(errorMessage(caughtError, "No se pudo crear el bloqueo."));
    } finally {
      setConfirmando(false);
    }
  }

  async function eliminar(bloqueo: Bloqueo) {
    setPendingDeleteId(bloqueo.id);
    try {
      await deleteBloqueo(zonaId, bloqueo.id);
      setBloqueos((previous) => previous.filter((item) => item.id !== bloqueo.id));
    } finally {
      setPendingDeleteId(undefined);
    }
  }

  return (
    <div className="gr-bloqueos">
      <section>
        <h2>Nuevo bloqueo por mantenimiento</h2>
        <form className="gr-form" onSubmit={revisar}>
          <TextField id="inicio" name="inicio" label="Desde" type="datetime-local" required disabled={revisando} />
          <TextField id="fin" name="fin" label="Hasta" type="datetime-local" required disabled={revisando} />
          <TextField id="motivo" name="motivo" label="Motivo" required minLength={3} pattern="\s*\S.+\S\s*" title="Escribe al menos 3 caracteres." maxLength={300} disabled={revisando} />
          {error && <Feedback error>{error}</Feedback>}
          <div className="gr-form-actions">
            <Button type="submit" disabled={revisando}>
              {revisando ? "Revisando…" : "Revisar bloqueo"}
            </Button>
          </div>
        </form>
      </section>

      {revision && (
        <section className="gr-bloqueo-revision">
          <h2>Confirmar bloqueo</h2>
          {revision.afectadas.length === 0 ? (
            <p>No hay reservas confirmadas en este rango.</p>
          ) : (
            <>
              <p>
                Hay {revision.afectadas.length} reserva(s) confirmada(s) en este rango. Se cancelarán todas al
                confirmar el bloqueo.
              </p>
              <ul className="gr-reserva-list">
                {revision.afectadas.map((reserva) => (
                  <li key={reserva.id} className="gr-reserva-item">
                    <div>
                      <strong>
                        {reserva.apartamento.torre} · {reserva.apartamento.numero}
                      </strong>
                      <span>
                        {reserva.fecha} {reserva.horaInicio}–{reserva.horaFin}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="gr-form-actions">
            <Button disabled={confirmando} onClick={confirmar}>
              {confirmando ? "Confirmando…" : "Confirmar bloqueo"}
            </Button>
            <Button variant="ghost" disabled={confirmando} onClick={() => setRevision(undefined)}>
              Cancelar
            </Button>
          </div>
        </section>
      )}

      <section>
        <h2>Bloqueos activos</h2>
        {status === "loading" && <Skeleton label="Cargando bloqueos" />}
        {status === "error" && (
          <EmptyState title="No pudimos cargar los bloqueos" description="Comprueba tu conexión e inténtalo de nuevo." />
        )}
        {status === "ready" && bloqueos.length === 0 && <p>No hay bloqueos activos para esta zona.</p>}
        {status === "ready" && bloqueos.length > 0 && (
          <ul className="gr-reserva-list">
            {bloqueos.map((bloqueo) => (
              <li key={bloqueo.id} className="gr-reserva-item">
                <div>
                  <strong>{bloqueo.motivo}</strong>
                  <span>
                    {new Date(bloqueo.inicio).toLocaleString("es-CO")} – {new Date(bloqueo.fin).toLocaleString("es-CO")}
                  </span>
                </div>
                <Button variant="ghost" disabled={pendingDeleteId === bloqueo.id} onClick={() => eliminar(bloqueo)}>
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
