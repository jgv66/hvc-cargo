import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { LoadingController } from '@ionic/angular';
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

  async ImprimirPicking( item ) {
    //
    this.listPrinter();
    await this.selectPrinter(this.bluetoothList[0].id);
    //
    const device = this.selectedPrinter;
    const datax = this.construirRecibo( item );
    //
    // console.log('Device mac: ', device);
    // console.log('Data: ', datax);
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
                  // this.funciones.muestraySale('Impresión exitosa', 1, 'bottom');
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
    // code39
    // receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;  // Select justification: Centering
    // receipt += '\x1d\x68\x50';  // Set barcode height: in case TM-T20, 6.25 mm (50/203 inches)
    // receipt += '\x1d\x48\x02';  // Select print position of HRI characters: Print position, below the barcode
    // receipt += '\x1d\x66\x01';  // Select font for HRI characters: Font B
    // receipt += '\x1d\x6b\x04';  // Print barcode: (A) format, barcode system = CODE39
    // receipt += item.id_paquete.toString();
    // receipt += '\x00';
    // receipt += commands.EOL;
    // receipt += commands.EOL;

    // receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;  // Select justification: Centering
    // receipt += '\x1d\x68\x50';  // Set barcode height: in case TM-T20, 6.25 mm (50/203 inches)
    // receipt += '\x1d\x48\x02';  // Select print position of HRI characters: Print position, below the barcode
    // receipt += '\x1d\x66\x00';  // Select font for HRI characters: Font B
    // receipt += '\x1d\x6b\x04';  // Print barcode: (A) format, barcode system = CODE39
    // receipt += item.id_paquete.toString();
    // receipt += '\x00';
    // receipt += commands.EOL;
    // receipt += commands.EOL;

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

    /*
    '// --- Print barcode39 --->>>
    '// Select justification: Centering
        ESC "a" 1
        "<< Bonus points : 14 >>"
    '// Print and feed paper: Paper feeding amount = 4.94 mm (35/180 inches)
        ESC "J" 35
    '// Set barcode height: in case TM-T20, 6.25 mm (50/203 inches)
        GS "h" 50
    '// Select print position of HRI characters: Print position, below the barcode
        GS "H" 2
    '// Select font for HRI characters: Font B
        GS "f" 1
    '// Print barcode: (A) format, barcode system = CODE39
        GS "k" 4 "*00014*" 0
    '// --- Print barcode ---<<<
    */

    /**
     * QRCode Assembly into ESC/POS bytes. <p>
     *
     * Function 065: Selects the model for QR Code. <p>
     * ASCII GS ( k pL pH cn 65 n1 n2 <p>
     *
     * Function 067: Sets the size of the module for QR Code in dots. <p>
     * ASCII GS ( k pL pH cn 67 n <p>
     *
     * Function 069: Selects the error correction level for QR Code. <p>
     * ASCII GS ( k pL pH cn 69 n <p>
     *
     * Function 080: Store the data in the symbol storage area <p>
     * ASCII GS ( k pL pH cn 80 m d1...dk <p>
     *
     * Function 081: Print the symbol data in the symbol storage area <p>
     * ASCII GS ( k pL pH cn 81 m <p>
     *
     *
     * @param data to be printed in barcode
     * @return bytes of ESC/POS commands to print the barcode
     */

    // QR
    // receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;  // Select justification: Centering

    // receipt += '\x1d\x68\x50';  // Set barcode height: in case TM-T20, 6.25 mm (50/203 inches)
    // receipt += '\x1d\x48\x02';  // Select print position of HRI characters: Print position, below the barcode
    // receipt += '\x1d\x66\x01';  // Select font for HRI characters: Font B
    // receipt += '\x1d\x6b\x04';  // Print barcode: (A) format, barcode system = CODE39
    // receipt += item.id_paquete.toString();
    // receipt += '\x00';
    // receipt += commands.EOL;
    // receipt += commands.EOL;

    // Function 065
    // bytes.write(GS);
    // bytes.write('(');
    // bytes.write('k');
    // bytes.write(4); // pL size of bytes
    // bytes.write(0); // pH size of bytes
    // bytes.write(49); // cn
    // bytes.write(65); // fn
    // bytes.write(model.value); // n1
    // bytes.write(0); // n2
    //           GS   (  k    4   0   49  65
    // receipt += '\x1d\x28\x6b\x04\x00\x49\x65\x01\x00';

    // Function 067
    // bytes.write(GS);
    // bytes.write('(');
    // bytes.write('k');
    // bytes.write(3); // pL size of bytes
    // bytes.write(0); // pH size of bytes
    // bytes.write(49); // cn
    // bytes.write(67); // fn
    // bytes.write(size); // n
    //           GS  (   k   3   0    49  67  3
    // receipt += '\x1d\x28\x6b\x03\x00\x49\x67\x03';

    // Function 069
    // bytes.write(GS);
    // bytes.write('(');
    // bytes.write('k');
    // bytes.write(3); // pL size of bytes
    // bytes.write(0); // pH size of bytes
    // bytes.write(49); // cn
    // bytes.write(69); // fn
    // bytes.write(errorCorrectionLevel.value); // n
    //           GS  (   k   3   0    49  69  15
    // receipt += '\x1d\x28\x6b\x03\x00\x49\x69\x15';

    // Function 080
    // int numberOfBytes = data.length() + 3;
    // int pL = numberOfBytes & 0xFF;
    // int pH = (numberOfBytes & 0xFF00) >> 8 ;
    // const numberOfBytes = item.id_paquete.toString().length + 3;
    // const pL = numberOfBytes & 0xFF;
    // const pH = (numberOfBytes & 0xFF00) >> 8 ;

    // bytes.write(GS);
    // bytes.write('(');
    // bytes.write('k');
    // bytes.write(pL); // pL size of bytes
    // bytes.write(pH); // pH size of bytes
    // bytes.write(49); // cn
    // bytes.write(80); // fn
    // bytes.write(48); // m
    // bytes.write(data.getBytes(),0,data.length());
    //           GS  (   k   3   0    49  67  3
    // receipt += '\x1d\x28\x6b\x03\x00\x49\x67\x03';

    // Function 081
    // bytes.write(GS);
    // bytes.write('(');
    // bytes.write('k');
    // bytes.write(3); // pL size of bytes
    // bytes.write(0); // pH size of bytes
    // bytes.write(49); // cn
    // bytes.write(81); // fn
    // bytes.write(48); // m

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
