import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule // Esta vaina tiene el *ngIf por lo que entendi es que permite mostrar cosas en el DOM si se cumple una condición para este caso el mensaje
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario = new FormControl();
  password = new FormControl();
  mensaje: string | null = null;
  mensajeClass: string = '';
  botonClickable: boolean = false; // Variable para habilitar/deshabilitar el botón

  constructor(private http: HttpClient, private router: Router) {
  }

  public login(): void {
    if (this.usuario.value && this.password.value) {
      this.http.post("http://localhost:8080/token", {
        "dni": this.usuario.value,
        "password": this.password.value
      }, {
        responseType: "text",
        observe: "response"
      }).subscribe({
        next: p => {
          if (p.status === 200) {
            if (typeof p.body === "string") {
              localStorage.setItem('token', p.body);
            }
            this.mostrarMensaje("Ingresando...", "exito", 1000);
            setTimeout(() => {
              this.router.navigate(['/citas']);
            }, 1000);
          }
        },
        error: () => {
          this.mostrarMensaje("Error al ingresar credenciales", "error", 2000);
        }
      });
    }
  }

  private mostrarMensaje(mensaje: string, tipo: string, duracion: number): void {
    this.mensaje = mensaje;
    this.mensajeClass = `mensaje ${tipo}`;
    setTimeout(() => {
      this.mensaje = null;
      this.mensajeClass = '';
    }, duracion);
  }

  public onKeyPress(event: KeyboardEvent): void {
    // Valida si se presiona la tecla Enter y los campos no están vacíos
    if (event.key === 'Enter' && this.usuario.value && this.password.value) {
      this.login();
    }
  }

  // Método para verificar si habilitar o no el botón de inicio de sesión
  public verificarBoton(): void {
    this.botonClickable = this.usuario.value && this.password.value;
  }
}
