import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Doctor } from '../interfaces/doctores';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { EncabezadosComponent } from '../encabezados/encabezados.component';
import { MenuComponent } from '../menu/menu.component';
import { Especialidad } from '../interfaces/especialidades';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctores',
  standalone: true,
  imports: [
    EncabezadosComponent,
    MenuComponent,
    NgForOf,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './doctores.component.html',
  styleUrls: ['./doctores.component.css']
})
export class DoctoresComponent {
  doctores: Array<Doctor> = [];
  mostrarRegistro: boolean = false;
  doctorEditando: Doctor | null = null;
  especialidades: Especialidad[] = Array();
  formDoctor: FormGroup;

  constructor(private http: HttpClient) {
    this.formDoctor = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl('', [Validators.required]),
      apellido: new FormControl('', [Validators.required]),
      especialidad: new FormControl('', [Validators.required])
    });
    this.obtenerDoctores();
    this.obtenerEspecialidades();
  }

  private obtenerDoctores() {
    const token = localStorage.getItem('token');
    this.http.get<Array<Doctor>>("http://localhost:8080/doctor/all", {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      doctoresResponse => {
        this.doctores = doctoresResponse;
      },
      doctoresError => {
        console.error('Error al obtener doctores:', doctoresError);
      }
    );
  }

  private obtenerEspecialidades() {
    const token = localStorage.getItem('token');
    this.http.get<Array<Especialidad>>("http://localhost:8080/especialidad/all", {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      especialidadResponse => {
        this.especialidades = especialidadResponse;
      },
      especialidadesError => {
        console.error('Error al obtener especialidades:', especialidadesError);
      }
    );
  }

  toggleRegistro() {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (!this.mostrarRegistro) {
      this.formDoctor.reset();
      this.doctorEditando = null;
    }
  }

  cerrarModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.toggleRegistro();
    }
  }

  registrarDoctor() {
    if (this.formDoctor.invalid) {
      alert('Por favor completa todos los campos antes de registrar.');
      return;
    }

    const token = localStorage.getItem('token');
    const nuevoDoctor = this.formDoctor.value;
    nuevoDoctor.is_deleted = false;

    this.http.post("http://localhost:8080/doctor", nuevoDoctor, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      response => {
        this.obtenerDoctores();
        this.toggleRegistro();
      },
      error => {
        console.error('Error al registrar doctor:', error);
      }
    );
  }

  editar(doctor: Doctor) {
    this.doctorEditando = doctor;
    this.formDoctor.setValue({
      id: doctor.id,
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      especialidad: doctor.especialidad
    });
    this.mostrarRegistro = true;
  }

  editarDoctor() {
    if (this.formDoctor.invalid) {
      alert('Por favor completa todos los campos antes de editar.');
      return;
    }

    const token = localStorage.getItem('token');
    this.http.put<Doctor>(`http://localhost:8080/doctor/${this.formDoctor.value.id}`, this.formDoctor.value, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      response => {
        this.obtenerDoctores();
        this.toggleRegistro();
      },
      error => {
        console.error('Error al editar doctor:', error);
      }
    );
  }

  eliminar(id: string) {
    const confirmar = window.confirm('¿Estás seguro que deseas eliminar este doctor?');
    if (!confirmar) return;

    const token = localStorage.getItem('token');
    this.http.delete(`http://localhost:8080/doctor/${id}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    }).subscribe(
      response => {
        this.obtenerDoctores();
      },
      error => {
        console.error('Error al eliminar doctor:', error);
      }
    );
  }

  trackById(index: number, doctor: Doctor): string {
    return doctor.id;
  }
}
