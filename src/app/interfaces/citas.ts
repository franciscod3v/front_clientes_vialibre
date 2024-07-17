import { Doctor } from "./doctores";

export interface Cita {
    id: string;
    orden: number;
    idUsuario: string;
    doctor: Doctor;
    especialidad: string;
    fechaYHora: string;
    costo: string;
    estado: string;
    diagnostico: string;
    is_deleted: boolean;
  }