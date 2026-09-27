import type { EstadoFranja } from "@/lib/types";

const LABELS: Record<EstadoFranja, string> = {
  DISPONIBLE: "Disponible",
  PARCIAL: "Cupo limitado",
  COMPLETA: "Completa",
  BLOQUEADA: "Bloqueada",
  FUERA_DE_ANTICIPACION: "No disponible aún",
};

const CLASSES: Record<EstadoFranja, string> = {
  DISPONIBLE: "gr-franja gr-franja--disponible",
  PARCIAL: "gr-franja gr-franja--parcial",
  COMPLETA: "gr-franja gr-franja--completa",
  BLOQUEADA: "gr-franja gr-franja--bloqueada",
  FUERA_DE_ANTICIPACION: "gr-franja gr-franja--fuera",
};

export function estadoFranjaLabel(estado: EstadoFranja): string {
  return LABELS[estado];
}

export function estadoFranjaClass(estado: EstadoFranja): string {
  return CLASSES[estado];
}

export function franjaSeleccionable(estado: EstadoFranja): boolean {
  return estado === "DISPONIBLE" || estado === "PARCIAL";
}
