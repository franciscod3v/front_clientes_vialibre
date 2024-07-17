import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    CommonModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',

})
export class MenuComponent {
  role: string = '';

  constructor(private http: HttpClient) {
    let tokenLocal: string | null = localStorage.getItem("token") ? localStorage.getItem("token") : "Test";

    let usuarioId: string;

    if (tokenLocal !== "Test" && tokenLocal !== null) {
      try {
        // Dividir el token en sus partes y obtener la parte del payload (índice 1)
        let payload = JSON.parse(atob(tokenLocal.split(".")[1]));
        usuarioId = payload.cargo ? payload.cargo : null;
        this.role = usuarioId;
      } catch (error) {
        console.error("Error al decodificar el token: ", error);
      }
    }

  }

}
