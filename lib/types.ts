export type EstadoFranja = "DISPONIBLE" | "PARCIAL" | "COMPLETA" | "BLOQUEADA" | "FUERA_DE_ANTICIPACION";
export type EstadoReserva = "CONFIRMADA" | "CANCELADA";
export type TipoCancelacion = "RESIDENTE" | "ADMINISTRACION" | "MANTENIMIENTO";

export type ZonaComun = {
  id: number;
  nombre: string;
  descripcion: string | null;
  horaApertura: string;
  horaCierre: string;
  duracionFranjaMinutos: number;
  aforo: number;
  anticipacionMinimaHoras: number;
  anticipacionMaximaDias: number;
  anticipacionCancelacionHoras: number;
  activa: boolean;
  franjasPorDia: number;
  ultimaFranjaIncompleta: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ZonaComunInput = {
  nombre: string;
  descripcion?: string | null;
  horaApertura: string;
  horaCierre: string;
  duracionFranjaMinutos: number;
  aforo: number;
  anticipacionMinimaHoras: number;
  anticipacionMaximaDias: number;
  anticipacionCancelacionHoras: number;
  confirmarFranjaIncompleta: boolean;
};

export type FranjaDisponibilidad = {
  inicio: string;
  fin: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoFranja;
  aforo: number;
  cuposRestantes: number;
  motivoBloqueo: string | null;
};

export type DiaDisponibilidad = {
  fecha: string;
  franjas: FranjaDisponibilidad[];
};

export type Disponibilidad = {
  zonaId: number;
  desde: string;
  hasta: string;
  consultadaEn: string;
  dias: DiaDisponibilidad[];
};

export type Reserva = {
  id: number;
  zona: { id: number; nombre: string | null };
  apartamento: { id: number; torre: string; numero: string };
  residente: { userId: number; nombre: string };
  fecha: string;
  horaInicio: string;
  horaFin: string;
  inicio: string;
  fin: string;
  estado: EstadoReserva;
  cancelacion: {
    canceladaEn: string;
    canceladaPorUserId: number;
    tipo: TipoCancelacion;
    motivo: string | null;
  } | null;
  createdAt: string;
};

export type MisReservas = {
  apartamento: { id: number; torre: string; numero: string };
  proximas: Reserva[];
  pasadas: Reserva[];
};

export type Bloqueo = {
  id: number;
  zonaId: number;
  inicio: string;
  fin: string;
  motivo: string;
  creadoPorUserId: number;
  createdAt: string;
};

export type PageResult<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
