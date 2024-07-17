import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-encabezados',
  standalone: true,
  imports: [],
  templateUrl: './encabezados.component.html',
  styleUrl: './encabezados.component.css'
})
export class EncabezadosComponent {
  usuario: string = "";

  constructor(private router: Router) {
    // @ts-ignore
    this.usuario = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).sub;
  }

  public logout(): void {
    localStorage.removeItem("token");
    this.router.navigate(['']);
  }
}
