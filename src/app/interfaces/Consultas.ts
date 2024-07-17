import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export class Consultas<T> {
  rutaBase: string = "http://localhost:8080";
  ruta: string = "";

  constructor(ruta: string, private http: HttpClient) {
    this.ruta = ruta;
  }

  public getConsultas(): Observable<T> {
    return this.http.get<T>(`${this.rutaBase}/${this.ruta}`,
      {
        headers:
          {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
      }
    );
  }
}
