import { Component } from '@angular/core';
import { EncabezadosComponent } from "../encabezados/encabezados.component";
import { MenuComponent } from "../menu/menu.component";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Usuarios } from "../interfaces/usuarios";
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Cita } from '../interfaces/citas';

@Component({
  selector: 'app-gestor-citas',
  standalone: true,
  imports: [
    EncabezadosComponent,
    MenuComponent,
    NgForOf,
    NgIf,
    FormsModule,

  ],
  templateUrl: './gestor-citas.component.html',
  styleUrl: './gestor-citas.component.css'
})

export class GestorCitasComponent {
  citas: Array<Cita> = [];
  mostrarRegistro: boolean = false;
  usuarioEditando: Cita | null = null;
  formUsuario: Cita = this.inicializarFormulario();

  constructor(private http: HttpClient) {
    this.obtenerUsuarios();
  }

  private obtenerUsuarios() {
    const token = localStorage.getItem('token');
    this.http.get<Array<Cita>>("http://localhost:8080/cita/all", {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      usersResponse => {
        this.citas = usersResponse;
      },
      usersError => {
        console.error('Error al obtener usuarios:', usersError);
      }
    );
  }

  toggleRegistro() {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (!this.mostrarRegistro) {
      this.formUsuario = this.inicializarFormulario();
      this.usuarioEditando = null;
    }
  }

  cerrarModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.toggleRegistro();
    }
  }

  editar(cita: Cita) {
    this.usuarioEditando = cita;
    this.formUsuario = { ...cita };
    this.mostrarRegistro = true;
  }

  editarUsuario() {
    if (!this.camposRequeridosLlenos()) {
      alert('Por favor completa todos los campos antes de editar.');
      return;
    }

    const token = localStorage.getItem('token');
    this.http.get<Usuarios>(`http://localhost:8080/cita/${this.formUsuario.id}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      usuarioExistente => {
        const usuarioActualizado = {
          ...usuarioExistente,
          diagnostico: this.formUsuario.diagnostico
        };
        this.http.post("http://localhost:8080/usuario", usuarioActualizado, {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + token
          })
        }).subscribe(
          response => {
            this.obtenerUsuarios();
            this.toggleRegistro();
          },
          error => {
            console.error('Error al editar usuario:', error);
          }
        );
      },
      error => {
        console.error('Error al obtener usuario existente:', error);
      }
    );
  }

  eliminar(id: string) {
    const confirmar = window.confirm('¿Estás seguro que deseas eliminar este usuario?');
    const token = localStorage.getItem('token');
    if (confirmar) {
      this.http.get<Usuarios>(`http://localhost:8080/usuario/${id}`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token
        })
      }).subscribe(
        usuarioExistente => {
          const usuarioEliminado = {
            ...usuarioExistente,
            is_deleted: true
          };
          console.log(usuarioEliminado)
          this.http.post("http://localhost:8080/cita", usuarioEliminado, {
            headers: new HttpHeaders({
              Authorization: 'Bearer ' + token
            })
          }).subscribe(
            response => {
              this.obtenerUsuarios();
            },
            error => {
              console.error('Error al eliminar usuario:', error);
            }
          );
        },
        error => {
          console.error('Error al obtener usuario existente:', error);
        }
      );
    }
  }

  private inicializarFormulario(): Cita {
    return {
      id: "",
      orden: 0,
      idUsuario: "String",
      doctor: {
        id: "",
        nombre: "",
        apellido: "",
        especialidad: "",
        is_deleted: false
      },
      especialidad: "",
      fechaYHora: "",
      costo: "",
      estado: "",
      diagnostico: "",
      is_deleted: false,
    };
  }

  private camposRequeridosLlenos(): boolean {
    return (
      this.formUsuario.diagnostico.trim() !== ''
    );
  }
}
