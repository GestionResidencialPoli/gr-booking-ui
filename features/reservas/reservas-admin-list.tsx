"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Dialog, EmptyState, Feedback, Skeleton, TextField } from "@gestionresidencial/shared-ui";
import { cancelarReservaAdmin, listReservasAdmin } from "@/lib/booking-client";
import { errorMessage } from "@/lib/error-message";
import type { EstadoReserva, PageResult, Reserva } from "@/lib/types";

const PAGE_SIZE = 20;

export function ReservasAdminList() {
  const [filtros, setFiltros] = useState<{ desde?: string; hasta?: string; estado?: EstadoReserva }>({});
  return <ReservasAdminWindow key={JSON.stringify(filtros)} filtros={filtros} onFiltrar={setFiltros} />;
}

function ReservasAdminWindow({
  filtros,
  onFiltrar,
}: {
  filtros: { desde?: string; hasta?: string; estado?: EstadoReserva };
  onFiltrar: (filtros: { desde?: string; hasta?: string; estado?: EstadoReserva }) => void;
}) {
  const [resultado, setResultado] = useState<PageResult<Reserva> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [cancelando, setCancelando] = useState<Reserva>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    listReservasAdmin({ ...filtros, page: 0, size: PAGE_SIZE })
      .then((result) => {
        if (active) {
          setResultado(result);
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

  function aplicarFiltros(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const desde = String(data.get("desde") || "") || undefined;
    const hasta = String(data.get("hasta") || "") || undefined;
    const estado = (String(data.get("estado") || "") || undefined) as EstadoReserva | undefined;
    onFiltrar({ desde, hasta, estado });
  }

  async function confirmarCancelacion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cancelando) return;
    setPending(true);
    setError(undefined);
    const motivo = String(new FormData(event.currentTarget).get("motivo") || "").trim();

    try {
      const actualizada = await cancelarReservaAdmin(cancelando.id, motivo);
      setResultado((previous) =>
        previous
          ? { ...previous, content: previous.content.map((item) => (item.id === actualizada.id ? actualizada : item)) }
          : previous,
      );
      setCancelando(undefined);
    } catch (caughtError) {
      setError(errorMessage(caughtError, "No se pudo cancelar la reserva."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <form className="gr-form gr-reserva-filtros" onSubmit={aplicarFiltros}>
        <TextField id="desde" name="desde" label="Desde" type="date" defaultValue={filtros.desde} />
        <TextField id="hasta" name="hasta" label="Hasta" type="date" defaultValue={filtros.hasta} />
        <div className="gr-field">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" defaultValue={filtros.estado ?? ""}>
            <option value="">Todos</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        <div className="gr-form-actions">
          <Button type="submit">Filtrar</Button>
        </div>
      </form>

      {status === "loading" && <Skeleton label="Cargando reservas" />}
      {status === "error" && (
        <EmptyState title="No pudimos cargar las reservas" description="Comprueba tu conexión e inténtalo de nuevo." />
      )}
      {status === "ready" && resultado && resultado.content.length === 0 && (
        <EmptyState title="No hay reservas con estos filtros" description="Ajusta los filtros e inténtalo de nuevo." />
      )}
      {status === "ready" && resultado && resultado.content.length > 0 && (
        <ul className="gr-reserva-list">
          {resultado.content.map((reserva) => (
            <li key={reserva.id} className="gr-reserva-item">
              <div>
                <strong>{reserva.zona.nombre ?? "Zona común"}</strong>
                <span>
                  {reserva.apartamento.torre} · {reserva.apartamento.numero} — {reserva.residente.nombre}
                </span>
                <span>
                  {reserva.fecha} {reserva.horaInicio}–{reserva.horaFin} — {reserva.estado}
                </span>
              </div>
              {reserva.estado === "CONFIRMADA" && (
                <Button variant="ghost" onClick={() => setCancelando(reserva)}>
                  Cancelar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(cancelando)}
        title="Cancelar reserva"
        closeLabel="Cerrar"
        onClose={() => setCancelando(undefined)}
      >
        <form className="gr-form" onSubmit={confirmarCancelacion}>
          <TextField id="motivo" name="motivo" label="Motivo de la cancelación" required minLength={3} pattern="\s*\S.+\S\s*" title="Escribe al menos 3 caracteres." maxLength={300} disabled={pending} />
          {error && <Feedback error>{error}</Feedback>}
          <div className="gr-form-actions">
            <Button type="submit" disabled={pending}>
              {pending ? "Cancelando…" : "Confirmar cancelación"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
