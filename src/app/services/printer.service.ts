import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { DatosService } from './datos.service';
import { FuncionesService } from './funciones.service';
import { commands } from './printer-commands';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  bluetoothList;
  selectedPrinter;

  constructor( public btSerial: BluetoothSerial,
               private datos: DatosService,
               private alertCtrl: AlertController,
               private loadCtrl: LoadingController,
               private funciones: FuncionesService ) {}

  // This will return a list of bluetooth devices
  searchBluetoothPrinter() {
    // console.log(this.btSerial.list());
    return this.btSerial.list();
  }

  // This will connect to bluetooth printer via the mac address provided
  connectToBluetoothPrinter(macAddress){
     return this.btSerial.connect(macAddress);
  }

  // This will disconnect the current bluetooth connection
  disconnectBluetoothPrinter() {
    return this.btSerial.disconnect();
  }

  printData(data) {
    // Devuelve una promesa
    return this.btSerial.write(data);
  }

  listPrinter() {
    this.searchBluetoothPrinter()
      .then( (resp) => {
        // console.log('listPrinter()', resp);
        this.bluetoothList = resp;
      },
      (err) => console.log
      );
  }

  selectPrinter(macAddress) {
    this.selectedPrinter = macAddress;
  }

  async ImprimeEncomienda( item ) {
    const alert = await this.alertCtrl.create({
      // header: 'Voucher de Encomienda',
      message: 'Desea imprimir el voucher?',      
      // message: 'Cuantas copias desea imprimir ?',      
      // inputs: [
      //   {
      //     name: 'cuantasCopias',
      //     type: 'number',
      //     placeholder: 'copias'
      //   }
      // ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Ok',
          handler: (data) => {
            // for (let i = 0; i < data.cuantasCopias; ++i ) {
              this.ImprimirPicking( item );
            // }
          }
        }
      ]
    });
    await alert.present();      
  }

  async ImprimirPicking( item ) {
    this.listPrinter();
    await this.selectPrinter(this.bluetoothList[0].id);
    //
    const device = this.selectedPrinter;
    const datax = this.construirRecibo( item );
    //
    const load = await this.loadCtrl.create({
      message: 'Imprimiendo...',
    });
    await load.present();
    //
    this.connectToBluetoothPrinter(device)
        .subscribe( (status) => {
            this.printData(this.noSpecialChars(datax))
              .then( async (printStatus) => {
                  await load.dismiss();
                  this.disconnectBluetoothPrinter();
              })
              .catch(async (error) => {
                // this.funciones.muestraySale('Impresión con problemas', 1, 'middle');
              });
        },
        async (error) => {
          this.funciones.muestraySale('No se pudo conectar a la impresora', 1, 'middle');
        },
    );
  }

  construirRecibo( item ) {
    // console.log(item);
    let receipt = '';
    receipt += commands.HARDWARE.HW_INIT;
    receipt += commands.TEXT_FORMAT.TXT_4SQUARE + commands.TEXT_FORMAT.TXT_ALIGN_CT + commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'HVC CARGO';
    receipt += commands.EOL + commands.EOL;
    receipt += '>>>> ' + item.id_paquete.toString() + ' <<<<' ;
    receipt += commands.EOL + commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ITALIC_OFF + commands.EOL + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.TEXT_FORMAT.TXT_NORMAL;
    // hasta aqui grande, ahora normal
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT ;
    receipt += 'Ingresa a nuestra página web ' + commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON + 'www.hidrovortice.cl' + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Y con tu número de orden ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.id_paquete.toString() + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Sigue online tu encomienda.' + commands.EOL + commands.EOL;
    receipt += commands.HORIZONTAL_LINE.HR3_58MM + commands.EOL; 
    // --------
    // hasta aqui grande, ahora normal
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT ;
    receipt += 'Retirador:' + commands.TEXT_FORMAT.TXT_BOLD_ON + this.datos.nombre + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += commands.HORIZONTAL_LINE.HR3_58MM + commands.EOL;
    // --------
    receipt += commands.TEXT_FORMAT.TXT_2WIDTH + commands.TEXT_FORMAT.TXT_ALIGN_CT + commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'ORIGEN' ;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL + commands.TEXT_FORMAT.TXT_ALIGN_LT + commands.EOL + commands.EOL;
    receipt += 'Cliente: ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.cli_razon + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Direcc.: ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.cli_direccion + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Comuna : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.cli_comuna + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Bultos : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.bultos.toString() + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Peso   : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.peso.toString() + 'Kg.' + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Volumen: ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.volumen.toString() + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Fono   : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.cli_fono1 + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += '#Doc.  : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.documento_legal +'-'+ item.numero_legal + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += commands.HORIZONTAL_LINE.HR3_58MM + commands.EOL;
    // --------
    receipt += commands.TEXT_FORMAT.TXT_2WIDTH + commands.TEXT_FORMAT.TXT_ALIGN_CT + commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'PAGO' ;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL + commands.TEXT_FORMAT.TXT_ALIGN_LT + commands.EOL + commands.EOL;
    receipt += 'Pago   : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.tipo_pago + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Tipo   : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.desc_pago + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Cobrar : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + '$' + item.valor_cobrado.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += commands.HORIZONTAL_LINE.HR3_58MM + commands.EOL;
    // --------
    receipt += commands.TEXT_FORMAT.TXT_2WIDTH + commands.TEXT_FORMAT.TXT_ALIGN_CT + commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'DESTINO' ;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL + commands.TEXT_FORMAT.TXT_ALIGN_LT + commands.EOL + commands.EOL;
    receipt += 'Destinat.: ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.des_razon + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Direccion: ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.des_direccion + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Comuna   : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.des_comuna + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += 'Fonos    : ' + commands.TEXT_FORMAT.TXT_BOLD_ON + item.des_fono1  + commands.TEXT_FORMAT.TXT_BOLD_OFF + commands.EOL;
    receipt += commands.HORIZONTAL_LINE.HR3_58MM + commands.EOL + commands.EOL;

    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;  // Select justification: Centering
    receipt += '\x1d\x68\x50';  // Set barcode height: in case TM-T20, 6.25 mm (50/203 inches)
    receipt += '\x1d\x77\x03';  // Set barcode width
    receipt += '\x1d\x48\x02';  // Select print position of HRI characters: Print position, below the barcode
    receipt += '\x1d\x66\x02';  // Select font for HRI characters: Font B
    receipt += '\x1d\x6b\x04';  // Print barcode: (A) format, barcode system = CODE39
    receipt += item.id_paquete.toString();
    receipt += '\x00';
    receipt += commands.EOL;
    receipt += commands.EOL;

    return receipt;

  }

  noSpecialChars( cadena ) {
    const translate = {
    à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a', æ: 'a', ç: 'c', è: 'e', é: 'e', ê: 'e', ë: 'e', ì: 'i', í: 'i', î: 'i', ï: 'i',
    ð: 'd', ñ: 'n', ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o', ø: 'o', ù: 'u', ú: 'u', û: 'u', ü: 'u', ý: 'y', þ: 'b', ÿ: 'y', ŕ: 'r',
    À: 'A', Á: 'A', Â: 'A', Ã: 'A', Ä: 'A', Å: 'A', Æ: 'A', Ç: 'C', È: 'E', É: 'E', Ê: 'E', Ë: 'E', Ì: 'I', Í: 'I', Î: 'I', Ï: 'I',
    Ð: 'D', Ñ: 'N', Ò: 'O', Ó: 'O', Ô: 'O', Õ: 'O', Ö: 'O', Ø: 'O', Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U', Ý: 'Y', Þ: 'B', Ÿ: 'Y', Ŕ: 'R',
    };
    const translateRe = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕŕÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÝÝÞŸŔŔ]/gim;
    return cadena.replace(translateRe, (match) => {
      return translate[match];
    });
  }

}
