import {Routes} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {UsuariosComponent} from "./usuarios/usuarios.component";
import { CitasComponent } from './citas/citas.component';
import { HorariosComponent } from './horarios/horarios.component';
import { EspecialidadesComponent } from './especialidades/especialidades.component';
import { DoctoresComponent } from './doctores/doctores.component';
import { GestorCitasComponent } from './gestor-citas/gestor-citas.component';

export const routes: Routes = [
  {path: "", component: LoginComponent},
  {path: "usuarios", component: UsuariosComponent},
  {path: "citas", component: CitasComponent},
  {path: "horario", component: HorariosComponent},
  {path: "especialidad", component: EspecialidadesComponent},
  {path: "doctor", component: DoctoresComponent},
  {path: "gestor", component: GestorCitasComponent}
];
