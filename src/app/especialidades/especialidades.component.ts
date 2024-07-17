import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Especialidad } from '../interfaces/especialidades';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncabezadosComponent } from '../encabezados/encabezados.component';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [
    EncabezadosComponent,
    MenuComponent,
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.css']
})
export class EspecialidadesComponent {
  especialidades: Array<Especialidad> = [];
  mostrarRegistro: boolean = false;
  especialidadEditando: Especialidad | null = null;
  formEspecialidad: Especialidad = this.inicializarFormulario();

  constructor(private http: HttpClient) {
    this.obtenerEspecialidades();
  }

  private obtenerEspecialidades() {
    const token = localStorage.getItem('token');
    this.http.get<Array<Especialidad>>("http://localhost:8080/especialidad/all", {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      especialidadesResponse => {
        this.especialidades = especialidadesResponse;
      },
      especialidadesError => {
        console.error('Error al obtener especialidades:', especialidadesError);
      }
    );
  }

  toggleRegistro() {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (!this.mostrarRegistro) {
      this.formEspecialidad = this.inicializarFormulario();
      this.especialidadEditando = null;
    }
  }

  cerrarModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.toggleRegistro();
    }
  }

  registrarEspecialidad() {
    if (!this.camposRequeridosLlenos()) {
      alert('Por favor completa todos los campos antes de registrar.');
      return;
    }
    const token = localStorage.getItem('token');
    const nuevaEspecialidad = {
      especialidad: this.formEspecialidad.especialidad,
      is_deleted: false
    };

    this.http.post("http://localhost:8080/especialidad", nuevaEspecialidad, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      response => {
        this.obtenerEspecialidades();
        this.toggleRegistro();
      },
      error => {
        console.error('Error al registrar especialidad:', error);
      }
    );
  }

  editar(especialidad: Especialidad) {
    this.especialidadEditando = especialidad;
    this.formEspecialidad = { ...especialidad };
    this.mostrarRegistro = true;
  }

  editarEspecialidad() {
    if (!this.camposRequeridosLlenos()) {
      alert('Por favor completa todos los campos antes de editar.');
      return;
    }

    const token = localStorage.getItem('token');
    this.http.get<Especialidad>(`http://localhost:8080/especialidad/${this.formEspecialidad.id}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      especialidadExistente => {
        const especialidadActualizada = {
          ...especialidadExistente,
          nombre: this.formEspecialidad.especialidad,
        };
        this.http.post("http://localhost:8080/especialidad", especialidadActualizada, {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + token
          })
        }).subscribe(
          response => {
            this.obtenerEspecialidades();
            this.toggleRegistro();
          },
          error => {
            console.error('Error al editar especialidad:', error);
          }
        );
      },
      error => {
        console.error('Error al obtener especialidad existente:', error);
      }
    );
  }

  eliminar(id: string) {
    const confirmar = window.confirm('¿Estás seguro que deseas eliminar esta especialidad?');
    const token = localStorage.getItem('token');
    if (confirmar) {
      this.http.get<Especialidad>(`http://localhost:8080/especialidad/${id}`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token
        })
      }).subscribe(
        especialidadExistente => {
          const especialidadEliminada = {
            ...especialidadExistente,
            is_deleted: true
          };
          this.http.post("http://localhost:8080/especialidad", especialidadEliminada, {
            headers: new HttpHeaders({
              Authorization: 'Bearer ' + token
            })
          }).subscribe(
            response => {
              this.obtenerEspecialidades();
            },
            error => {
              console.error('Error al eliminar especialidad:', error);
            }
          );
        },
        error => {
          console.error('Error al obtener especialidad existente:', error);
        }
      );
    }
  }

  private inicializarFormulario(): Especialidad {
    return {
      id: "",
      especialidad: '',
      doctores: [],
      is_deleted: false,
    };
  }

  private camposRequeridosLlenos(): boolean {
    return this.formEspecialidad.especialidad.trim() !== '';
  }

  trackById(index: number, especialidad: Especialidad): string {
    return especialidad.id;
  }
}
