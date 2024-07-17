import { Doctor } from "./doctores";

export interface Especialidad {
    id: string,
    especialidad: string,
    doctores: Array<Doctor>,
    is_deleted: boolean
}