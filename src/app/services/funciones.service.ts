import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Plugins, FilesystemDirectory, CameraPhoto } from '@capacitor/core';
//
const { Camera, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class FuncionesService {

  constructor(private alertCtrl: AlertController,
              private platform: Platform,
              private toastCtrl: ToastController) { }

  textoSaludo() {
    const dia   = new Date();
    if ( dia.getHours() >= 8  && dia.getHours() < 12 ) {
      return 'Buenos días ';
    } else if ( dia.getHours() >= 12 && dia.getHours() < 19 ) {
      return 'Buenas tardes ';
    } else {
      return 'Buenas noches ';
    }
  }

  async msgAlert( titulo, texto, subtitulo?, color? ) {
    const alert = await this.alertCtrl.create({
      // header: titulo,
      subHeader: ( subtitulo ) ? subtitulo : null,
      message: texto,
      buttons: ['OK'],
      mode: 'md'
      // cssClass: ( color ) ? 'alertDanger' : 'alertNormal'
    });
    await alert.present();
  }

  async muestraySale( cTexto, segundos, posicion? ) {
    const toast = await this.toastCtrl.create({
      message: cTexto,
      duration: 1500 * segundos,
      position: posicion || 'middle'
    });
    toast.present();
  }

  diferenciaEntreDiasEnDias( a, b ) {
    //
    const MILISENGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    //
    return Math.floor((utc2 - utc1) / MILISENGUNDOS_POR_DIA);
    //
  }

  diaSemana( fecha: Date ) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[ fecha.getUTCDay() ];
  }

  nombreMes( fecha: Date ) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[ fecha.getMonth() ];
  }

  fechaHumano( fecha ) {
    return this.diaSemana( fecha ) + ' ' + fecha.getDate().toString() + ' de ' + this.nombreMes( fecha ) + ', ' + fecha.getFullYear().toString();
  }

  number_format( amount, decimals ) {
    //
    amount += ''; // por si pasan un numero en vez de un string
    amount = parseFloat(amount.replace(/[^0-9\.]/g, '')); // elimino cualquier cosa que no sea numero o punto

    decimals = decimals || 0; // por si la variable no fue fue pasada

    // si no es un numero o es igual a cero retorno el mismo cero
    if ( isNaN(amount) || amount === 0 ) {
        return parseFloat( '0' ).toFixed(decimals);
    }

    // si es mayor o menor que cero retorno el valor formateado como numero
    amount = '' + amount.toFixed(decimals);

    const amountParts = amount.split('.');
    const regexp = /(\d+)(\d{3})/;

    while ( regexp.test(amountParts[0]) ) {
      amountParts[0] = amountParts[0].replace(regexp, '$1' + ',' + '$2');
    }
    return amountParts.join('.');
  }

  // LZW-compress a string
  lzw_encode(s) {
    const dict = {};
    const data = (s + '').split('');
    const out = [];
    let currChar;
    let phrase = data[0];
    let code = 256;
    for (let i = 1; i < data.length; i++) {
        currChar = data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        } else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase = currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (let i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join('');
  }

  // Decompress an LZW-encoded string
  lzw_decode(s) {
    const dict = {};
    const data = (s + '').split('');
    let currChar = data[0];
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase;
    for (let i = 1; i < data.length; i++) {
        const currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        } else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join('');
  }

}
