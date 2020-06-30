import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plugins } from '@capacitor/core';

import { SERVER_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  url = SERVER_URL;     // 'http://23.239.29.171:3070';
  ficha: string;        // numero de ficha del usuario dentro de softland
  nombre: string;       // nombre del usuario en softland
  email: string;        // email del usuario en softland
  idempresa: number;    // id de la empresa 1,2,3...
  nombreemp: string;    // nombre de la empresa
  logeado = false;

  constructor( private http: HttpClient ) {
    this.logeado = false;
  }

  servicioWEB( cSP: string, parametros?: any ) {
    const url    = this.url + cSP;
    const body   = parametros;
    return this.http.post( url, body );
  }

  // set a key/value
  async guardarDato( key, value ) {
    await Plugins.Storage.set({ key, value });
  }

  async leerDato( key ) {
    const { value } = await Plugins.Storage.get({ key });
    return value;
  }

}
