import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { PrintService } from '../../services/printer.service';

@Component({
  selector: 'app-revisarretiro',
  templateUrl: './revisarretiro.page.html',
  styleUrls: ['./revisarretiro.page.scss'],
})
export class RevisarretiroPage implements OnInit {

  @Input() item;
  @Input() titulo;

  foto = null;
  cargando = false;

  constructor( private modalCtrl: ModalController,
               private printer: PrintService,
               private alertCtrl: AlertController ) { }

  ngOnInit() {
    this.printer.listPrinter();
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  ImprimeEncomienda() {
    this.printer.ImprimirPicking( this.item );
  }

  async retirar() {
    const alert = await this.alertCtrl.create({
      header: 'Yo voy a retirar...',
      message: 'Al aceptar esta opción, el sistema iniciará el tracking del retiro y le asignará esta encomienda.<br><br><strong>Está seguro ?</strong>',
      mode: 'ios',
      buttons: [
        {
          text: 'No, abandonar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Sí, yo voy',
          handler: () => { this.pickup(); }
        }
      ]
    });
    await alert.present();
  }

  pickup() {
    this.modalCtrl.dismiss({ retirar: true });
  }

}
