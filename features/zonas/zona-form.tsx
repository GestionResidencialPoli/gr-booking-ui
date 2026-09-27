"use client";

import { useState, type FormEvent } from "react";
import { Button, Dialog, Feedback, TextField } from "@gestionresidencial/shared-ui";
import { errorCode, errorDetails, errorMessage } from "@/lib/error-message";
import type { ZonaComun, ZonaComunInput } from "@/lib/types";

export function ZonaForm({
  initial,
  onSubmit,
  submitLabel,
  pendingLabel,
}: {
  initial?: ZonaComun;
  onSubmit: (input: ZonaComunInput) => Promise<void>;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [franjaIncompleta, setFranjaIncompleta] = useState<{
    input: ZonaComunInput;
    minutosUltimaFranja: number;
    franjasPorDia: number;
  }>();

  function inputFrom(data: FormData): ZonaComunInput {
    return {
      nombre: String(data.get("nombre") || "").trim(),
      descripcion: String(data.get("descripcion") || "").trim() || null,
      horaApertura: String(data.get("horaApertura")),
      horaCierre: String(data.get("horaCierre")),
      duracionFranjaMinutos: Number(data.get("duracionFranjaMinutos")),
      aforo: Number(data.get("aforo")),
      anticipacionMinimaHoras: Number(data.get("anticipacionMinimaHoras")),
      anticipacionMaximaDias: Number(data.get("anticipacionMaximaDias")),
      anticipacionCancelacionHoras: Number(data.get("anticipacionCancelacionHoras")),
      confirmarFranjaIncompleta: false,
    };
  }

  async function enviar(input: ZonaComunInput) {
    setPending(true);
    setError(undefined);
    try {
      await onSubmit(input);
    } catch (caughtError) {
      if (errorCode(caughtError) === "FRANJA_INCOMPLETA") {
        const details = errorDetails(caughtError) ?? {};
        setFranjaIncompleta({
          input,
          minutosUltimaFranja: Number(details.minutosUltimaFranja ?? 0),
          franjasPorDia: Number(details.franjasPorDia ?? 0),
        });
        return;
      }
      setError(errorMessage(caughtError, "No se pudo guardar la zona."));
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await enviar(inputFrom(new FormData(event.currentTarget)));
  }

  async function confirmarFranjaIncompleta() {
    if (!franjaIncompleta) return;
    setFranjaIncompleta(undefined);
    await enviar({ ...franjaIncompleta.input, confirmarFranjaIncompleta: true });
  }

  return (
    <>
      <form className="gr-form" onSubmit={handleSubmit}>
        <TextField id="nombre" name="nombre" label="Nombre" defaultValue={initial?.nombre} required maxLength={100} disabled={pending} />
        <div className="gr-field">
          <label htmlFor="descripcion">Descripción (opcional)</label>
          <textarea id="descripcion" name="descripcion" defaultValue={initial?.descripcion ?? ""} maxLength={500} disabled={pending} />
        </div>
        <TextField
          id="horaApertura"
          name="horaApertura"
          label="Hora de apertura"
          type="time"
          defaultValue={initial?.horaApertura?.slice(0, 5)}
          required
          disabled={pending}
        />
        <TextField
          id="horaCierre"
          name="horaCierre"
          label="Hora de cierre"
          type="time"
          defaultValue={initial?.horaCierre?.slice(0, 5)}
          required
          disabled={pending}
        />
        <TextField
          id="duracionFranjaMinutos"
          name="duracionFranjaMinutos"
          label="Duración de cada franja (minutos)"
          type="number"
          min={15}
          max={1440}
          defaultValue={initial?.duracionFranjaMinutos ?? 60}
          required
          disabled={pending}
        />
        <TextField
          id="aforo"
          name="aforo"
          label="Aforo simultáneo"
          type="number"
          min={1}
          max={500}
          defaultValue={initial?.aforo ?? 1}
          required
          disabled={pending}
        />
        <TextField
          id="anticipacionMinimaHoras"
          name="anticipacionMinimaHoras"
          label="Anticipación mínima para reservar (horas)"
          type="number"
          min={0}
          max={8760}
          defaultValue={initial?.anticipacionMinimaHoras ?? 0}
          required
          disabled={pending}
        />
        <TextField
          id="anticipacionMaximaDias"
          name="anticipacionMaximaDias"
          label="Anticipación máxima para reservar (días)"
          type="number"
          min={1}
          max={365}
          defaultValue={initial?.anticipacionMaximaDias ?? 30}
          required
          disabled={pending}
        />
        <TextField
          id="anticipacionCancelacionHoras"
          name="anticipacionCancelacionHoras"
          label="Anticipación mínima para cancelar (horas)"
          type="number"
          min={0}
          max={8760}
          defaultValue={initial?.anticipacionCancelacionHoras ?? 0}
          required
          disabled={pending}
        />
        {error && <Feedback error>{error}</Feedback>}
        <div className="gr-form-actions">
          <Button type="submit" disabled={pending}>
            {pending ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>

      <Dialog
        open={Boolean(franjaIncompleta)}
        title="La última franja quedará incompleta"
        closeLabel="Cancelar"
        onClose={() => setFranjaIncompleta(undefined)}
      >
        <p>
          Con esta duración, el horario alcanza para {franjaIncompleta?.franjasPorDia} franjas completas y una
          última de {franjaIncompleta?.minutosUltimaFranja} minutos. ¿Quieres guardar la zona así?
        </p>
        <div className="gr-form-actions">
          <Button onClick={confirmarFranjaIncompleta}>Guardar de todas formas</Button>
        </div>
      </Dialog>
    </>
  );
}
