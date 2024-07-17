import {Component} from '@angular/core';
import {EncabezadosComponent} from "../encabezados/encabezados.component";
import {MenuComponent} from "../menu/menu.component";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Usuarios} from "../interfaces/usuarios";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    EncabezadosComponent,
    MenuComponent,
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  usuarios: Array<Usuarios> = [];
  mostrarRegistro: boolean = false;
  usuarioEditando: Usuarios | null = null;
  formUsuario: Usuarios = this.inicializarFormulario();

  constructor(private http: HttpClient) {
    this.obtenerUsuarios();
  }

  private obtenerUsuarios() {
    const token = localStorage.getItem('token');
    this.http.get<Array<Usuarios>>("http://localhost:8080/usuario/all", {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      usersResponse => {
        this.usuarios = usersResponse;
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

  registrarUsuario() {
    if (!this.camposRequeridosLlenos()) {
      alert('Por favor completa todos los campos antes de registrar.');
      return;
    }
    const token = localStorage.getItem('token');
    // Definir el nuevo usuario
    const nuevoUsuario = {
      nombre: this.formUsuario.nombre,
      apellido: this.formUsuario.apellido,
      password: this.formUsuario.password,
      cargo: this.formUsuario.cargo,
      dni: this.formUsuario.dni,
      is_deleted: false  // Aseguramos que el valor es un booleano
    };

    console.log('Nuevo usuario a registrar:', nuevoUsuario);

    // Realizar la solicitud POST
    this.http.post("http://localhost:8080/usuario", nuevoUsuario, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      response => {
        console.log('Respuesta del servidor:', response);
        this.obtenerUsuarios();
        this.toggleRegistro();
      },
      error => {
        console.error('Error al registrar usuario:', error);
      }
    );
  }

  editar(usuario: Usuarios) {
    this.usuarioEditando = usuario;
    this.formUsuario = {...usuario};
    this.mostrarRegistro = true;
  }

  editarUsuario() {
    if (!this.camposRequeridosLlenos()) {
      alert('Por favor completa todos los campos antes de editar.');
      return;
    }

    const token = localStorage.getItem('token');
    this.http.get<Usuarios>(`http://localhost:8080/usuario/${this.formUsuario.id}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      usuarioExistente => {
        const usuarioActualizado = {
          ...usuarioExistente,
          nombre: this.formUsuario.nombre,
          apellido: this.formUsuario.apellido,
          username: this.formUsuario.password,
          cargo: this.formUsuario.cargo,
          dni: this.formUsuario.dni
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
          this.http.post("http://localhost:8080/usuario", usuarioEliminado, {
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

  private inicializarFormulario(): Usuarios {
    return {
      id: "",
      nombre: '',
      apellido: '',
      password: '',
      cargo: '',
      dni: '',
      is_deleted: true,
    };
  }

  private camposRequeridosLlenos(): boolean {
    return (
      this.formUsuario.nombre.trim() !== '' &&
      this.formUsuario.apellido.trim() !== '' &&
      this.formUsuario.password.trim() !== '' &&
      this.formUsuario.cargo.trim() !== '' &&
      this.formUsuario.dni.trim() !== ''
    );
  }
}
