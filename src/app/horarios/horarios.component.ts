import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Horario, DetalleHorario } from '../interfaces/horarios';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncabezadosComponent } from '../encabezados/encabezados.component';
import { MenuComponent } from '../menu/menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    EncabezadosComponent,
    MenuComponent,
    NgForOf,
    NgIf,
    FormsModule,
    CommonModule
  ],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css']
})
export class HorariosComponent {
  horarios: Array<Horario> = [];
  mostrarRegistro: boolean = false;
  horarioEditando: Horario | null = null;
  formHorario: Horario = this.inicializarFormulario();
  hoy: Date = new Date();

  constructor(private http: HttpClient) {
    this.obtenerHorarios();
  }

  private obtenerHorarios() {
    const token = localStorage.getItem('token');
    this.http.get<Array<Horario>>('http://localhost:8080/horario/all', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      horariosResponse => {
        this.horarios = horariosResponse;
      },
      horariosError => {
        console.error('Error al obtener horarios:', horariosError);
      }
    );
  }

  toggleRegistro() {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (!this.mostrarRegistro) {
      this.formHorario = this.inicializarFormulario();
      this.horarioEditando = null;
    }
  }

  cerrarModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.toggleRegistro();
    }
  }

  registrarHorario() {
    if (!this.camposRequeridosLlenos()) {
      alert('Por favor completa todos los campos antes de registrar.');
      return;
    }
    const token = localStorage.getItem('token');
    const nuevoHorario = {
      fecha: this.formHorario.fecha,
      numCitas: 20,
      detalleHorarios: [
        {especialidad: 'Infectología', citas: []},
        {especialidad: 'Psicología', citas: []},
        {especialidad: 'Laboratorio', citas: []}
      ],
      is_deleted: false,
    };

    this.http.post('http://localhost:8080/horario', nuevoHorario, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      response => {
        this.obtenerHorarios();
        this.toggleRegistro();
      },
      error => {
        console.error('Error al registrar horario:', error);
      }
    );
  }

  editar(horario: Horario) {
    this.horarioEditando = horario;
    this.formHorario = { ...horario };
    this.mostrarRegistro = true;
  }

  editarHorario() {
    if (!this.camposRequeridosLlenos()) {
      alert('Por favor completa todos los campos antes de editar.');
      return;
    }

    const token = localStorage.getItem('token');
    this.http.get<Horario>(`http://localhost:8080/horario/${this.formHorario.id}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      horarioExistente => {
        const horarioActualizado = {
          ...horarioExistente,
          fecha: this.formHorario.fecha,
          detalleHorarios: this.formHorario.detalleHorarios,
        };
        this.http.post('http://localhost:8080/horario', horarioActualizado, {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + token
          })
        }).subscribe(
          response => {
            this.obtenerHorarios();
            this.toggleRegistro();
          },
          error => {
            console.error('Error al editar horario:', error);
          }
        );
      },
      error => {
        console.error('Error al obtener horario existente:', error);
      }
    );
  }

  eliminar(id: string) {
    const confirmar = window.confirm('¿Estás seguro que deseas eliminar este horario?');
    const token = localStorage.getItem('token');
    if (confirmar) {
      this.http.get<Horario>(`http://localhost:8080/horario/${id}`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token
        })
      }).subscribe(
        horarioExistente => {
          const horarioEliminado = {
            ...horarioExistente,
            is_deleted: true
          };
          this.http.post('http://localhost:8080/horario', horarioEliminado, {
            headers: new HttpHeaders({
              Authorization: 'Bearer ' + token
            })
          }).subscribe(
            response => {
              this.obtenerHorarios();
            },
            error => {
              console.error('Error al eliminar horario:', error);
            }
          );
        },
        error => {
          console.error('Error al obtener horario existente:', error);
        }
      );
    }
  }

  private inicializarFormulario(): Horario {
    return {
      id: '',
      fecha: '',
      numCitas: 0,
      detalleHorarios: [
        { especialidad: 'Infectología', citas: [], citasDisponibles: 20 },
        { especialidad: 'Psicología', citas: [], citasDisponibles: 20 },
        { especialidad: 'Laboratorio', citas: [], citasDisponibles: 20 }
      ],
      is_deleted: false
    };
  }

  private camposRequeridosLlenos(): boolean {
    return this.formHorario.fecha.trim() !== '';
  }

  trackById(index: number, item: Horario) {
    return item.id;
  }
}
