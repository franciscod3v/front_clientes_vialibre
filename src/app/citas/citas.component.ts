import { Component } from '@angular/core';
import { EncabezadosComponent } from "../encabezados/encabezados.component";
import { MenuComponent } from "../menu/menu.component";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { NgForOf, NgIf } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Cita } from '../interfaces/citas';
import { Doctor } from '../interfaces/doctores';
import { Consultas } from '../interfaces/Consultas';
import { CommonModule } from '@angular/common';
import { Especialidad } from '../interfaces/especialidades';
import { Horario } from '../interfaces/horarios';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    EncabezadosComponent,
    MenuComponent,
    NgForOf,
    NgIf,
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent {
  //Doctores
  doctores: Doctor[] = [];
  arregloDoctores : Doctor[] = [];
  doctorElegido: Doctor = {id: '', nombre: '', apellido: '', especialidad: '', is_deleted: false};
  idDoctor = new FormControl('', [Validators.min(1), Validators.required, Validators.minLength(1)]);
  doctoresEspecialidadElegida: Doctor[] = [];
  //Especialidad
  idEspecialidad = new FormControl('', [Validators.min(1), Validators.required, Validators.minLength(1)]);
  especialidades: Especialidad[] = [];
  //Horarios
  horarioTotales: Horario[] = [];
  horariosEspecialidad: Horario[] = [];
  //Fecha Cita
  fecha: string = "";
  fechaElegida = new FormControl('', [Validators.min(1), Validators.required, Validators.minLength(1)]);
  //Citas
  citas: Cita[] = [];
  numCitasDisponibles: number = 20;
  //Formularios
  mostrarRegistro = false;
  citaEditando: Cita | null = null;
  formCita: FormGroup;

  constructor(private http: HttpClient) {

    this.formCita = new FormGroup({
      doctorId: new FormControl('', [Validators.required]),
      especialidad: new FormControl('', [Validators.required]),
      fechaYHora: new FormControl('', [Validators.required]),
    });

    this.obtenerCitas();
    console.log(this.citas)
    this.obtenerEspecialidad();
    console.log(this.especialidades)
    this.obtenerDoctores();
    console.log(this.doctores)
    this.obtenerHorarios();
    console.log(this.horarioTotales)
  }

  private obtenerCitas() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<Array<Cita>>("http://localhost:8080/cita/all", {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe(
        citasResponse => {
          console.log(citasResponse)
          this.citas = citasResponse;
        },
        citasError => {
          console.error('Error al obtener citas:', citasError);
        }
      );
    } else {
      console.error('No se encontró un token en el localStorage');
    }
  }

  private obtenerDoctores() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<Array<Doctor>>("http://localhost:8080/doctor/all", {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe(
        doctorResponse => {
          console.log(doctorResponse)
          this.doctores = doctorResponse;
        },
        citasError => {
          console.error('Error al obtener citas:', citasError);
        }
      );
    } else {
      console.error('No se encontró un token en el localStorage');
    }
  }

  private obtenerHorarios() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<Array<Horario>>("http://localhost:8080/horario/all", {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe(
        horarioResponse => {
          console.log(horarioResponse)
          this.horarioTotales = horarioResponse;
        },
        citasError => {
          console.error('Error al obtener citas:', citasError);
        }
      );
    } else {
      console.error('No se encontró un token en el localStorage');
    }
  }

  private obtenerEspecialidad() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<Array<Especialidad>>("http://localhost:8080/especialidad/all", {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe(
        especialidadResponse => {
          this.especialidades = especialidadResponse;
        },
        citasError => {
          console.error('Error al obtener citas:', citasError);
        }
      );
    } else {
      console.error('No se encontró un token en el localStorage');
    }
  }

  toggleRegistro() {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (!this.mostrarRegistro) {
      this.formCita.reset();
      this.citaEditando = null;
    }
  }

  cerrarModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.toggleRegistro();
    }
  }

  registrarCita() {

    if(this.numCitasDisponibles <= 0) {
      alert('No hay citas disponibles');
      return;
    }

    //Especialidad
    const idESpecialidadElegida = this.idEspecialidad.value;

    const especialidadElegida = this.especialidades.find(e => e.id === idESpecialidadElegida);

    const textEspecialidad = especialidadElegida?.especialidad;

    const citasDeLaEspecialidad = this.citas.filter(c => c.especialidad == textEspecialidad);
    const citasDeLaFecha = citasDeLaEspecialidad.filter(c => c.fechaYHora == this.fechaElegida.value);
    const cantidadDeCitasDisponibles = citasDeLaFecha.length;

    //Doctor

    const idDoctorElegido = this.idDoctor.value;

    const doctorElegido = this.doctores.find(d => d.id === idDoctorElegido);


    const token = localStorage.getItem('token');

    if (token) {
      const nuevaCita = {
        orden: cantidadDeCitasDisponibles + 1,
        idUsuario: "string",
        doctor: doctorElegido,
        especialidad: textEspecialidad,
        fechaYHora: this.fechaElegida.value,
        costo: "30",
        estado: "Programada",
        is_deleted: false
      };

      this.http.post("http://localhost:8080/cita", nuevaCita, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe(
        response => {
          this.obtenerCitas();
          this.toggleRegistro();
        },
        error => {
          console.error('Error al registrar cita:', error);
        }
      );

      const horarioElegido = this.horarioTotales.find(h => h.fecha === this.fechaElegida.value);
      const idHorarioElegido: string = horarioElegido?.id || "Test";
      let horarioActualizado = null;

      if (textEspecialidad === "Infectología") {
        console.log("Ingresa a Infec")
        const cantidadDeCitas = horarioElegido?.detalleHorarios[0]?.citasDisponibles || 0;
        horarioActualizado = {
          ...horarioElegido,
          detalleHorarios: [
            {
              especialidad: "Infectología",
              citasDisponibles: cantidadDeCitas + 1,
            }
          ]
        }
      } else if(textEspecialidad === "Psicología") {
        console.log("Ingresa a Psico")
        const cantidadDeCitas = horarioElegido?.detalleHorarios[1]?.citasDisponibles || 0;
        horarioActualizado = {
          ...horarioElegido,
          detalleHorarios: [
            {
              especialidad: "Psicología",
              citasDisponibles: cantidadDeCitas + 1,
            }
          ]
        }
      } else if(textEspecialidad === "Laboratorio") {
        console.log("Ingresa a Lab")
        const cantidadDeCitas = horarioElegido?.detalleHorarios[2]?.citasDisponibles || 0;
        horarioActualizado = {
          ...horarioElegido,
          detalleHorarios: [
            {
              especialidad: "Laboratorio",
              citasDisponibles: cantidadDeCitas + 1,
            }
          ]
        }
      }

      
      this.http.post("http://localhost:8080/horario", horarioActualizado, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe(
        response => {
          this.obtenerCitas();
          this.toggleRegistro();
        },
        error => {
          console.error('Error al registrar cita:', error);
        }
      );

    } else {
      console.log("No se encontró el token");
    }
  }

  editar(cita: Cita) {
    this.citaEditando = cita;
    this.formCita.setValue({
      idUsuario: cita.idUsuario,
      doctorId: cita.doctor.id,
      especialidad: cita.especialidad,
      fechaYHora: cita.fechaYHora.split('T')[0],
      costo: cita.costo,
      estado: cita.estado,
      diagnostico: cita.diagnostico
    });
    this.mostrarRegistro = true;
  }

  editarCita() {
    if (this.formCita.invalid) {
      alert('Por favor completa todos los campos antes de editar.');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      const citaActualizada = {
        ...this.formCita.value,
        fechaYHora: new Date(this.formCita.value.fechaYHora).toISOString(),
        is_deleted: false
      };

      this.http.post("http://localhost:8080/cita", citaActualizada, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe(
        response => {
          this.obtenerCitas();
          this.toggleRegistro();
        },
        error => {
          console.error('Error al editar cita:', error);
        }
      );
    } else {
      console.error('Token no encontrado en localStorage');
    }
  }

  eliminar(id: string) {
    const confirmar = window.confirm('¿Estás seguro que deseas eliminar esta cita?');
    if (confirmar) {
      const token = localStorage.getItem('token');
      if (token) {
        this.http.get<Cita>(`http://localhost:8080/cita/${id}`, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`
          })
        }).subscribe(
          citaExistente => {
            const citaEliminada = {
              ...citaExistente,
              is_deleted: true
            };

            this.http.post("http://localhost:8080/cita", citaEliminada, {
              headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
              })
            }).subscribe(
              response => {
                this.obtenerCitas();
              },
              error => {
                console.error('Error al eliminar cita:', error);
              }
            );
          },
          error => {
            console.error('Error al obtener cita existente:', error);
          }
        );
      } else {
        console.error('Token no encontrado en localStorage');
      }
    }
  }

  onEspecialidadChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;

    const selectedText = selectElement.selectedOptions[0].text;

    const selectedEspecialidad = this.especialidades.find(e => e.especialidad === selectedText);

    if (selectedEspecialidad) {
      this.doctoresEspecialidadElegida = this.doctores.filter(doctor => doctor.especialidad === selectedEspecialidad.especialidad);
    } else {
      this.doctoresEspecialidadElegida = [];
    }

    //Validando número de cita
    /*const horariosDelDia = this.horarioTotales.filter(h => h.fecha === this.fechaElegida.value);
    console.log(horariosDelDia);
    let citasDisponibles = 0;
    if(selectedText === "Infectología") {
      console.log("Selected Infec");
      citasDisponibles = 20 - horariosDelDia[0].detalleHorarios[0].citasDisponibles;
      this.numCitasDisponibles = citasDisponibles;
    } else if (selectedText === "Psicología") {
      console.log("Selected Psicología");
      citasDisponibles = 20 - horariosDelDia[1].detalleHorarios[1].citasDisponibles;
      this.numCitasDisponibles = citasDisponibles;
    } else if (selectedText === "Laboratorio") {
      console.log("Selected Laboratorio");
      citasDisponibles = 20 - horariosDelDia[1].detalleHorarios[2].citasDisponibles;
      this.numCitasDisponibles = citasDisponibles;
    }*/
  }

}
