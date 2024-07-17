import { Cita } from "./citas";

export interface Horario {
    id: string,
    fecha: string,
    numCitas: number,
    detalleHorarios: Array<DetalleHorario>
    is_deleted: boolean
}

export interface DetalleHorario {
    citasDisponibles: number,
    especialidad: string,
    citas: Array<Cita>,
}