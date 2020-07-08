import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-revisarretiro',
  templateUrl: './revisarretiro.page.html',
  styleUrls: ['./revisarretiro.page.scss'],
})
export class RevisarretiroPage implements OnInit {

  @Input() item;
  @Input() acopio;

  titulo = '';

  constructor( private modalCtrl: ModalController,
               private alertCtrl: AlertController ) { }

  ngOnInit() {
    this.titulo = this.acopio === true ? 'Pendiente de acopiar' : 'Retiro Pendiente';
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  async retirar() {
    const alert = await this.alertCtrl.create({
      header: 'Yo voy a retirarla...',
      message: 'Al aceptar esta opción, el sistema iniciará el tracking del despacho y le asignará este retiro de encomienda.<br><br><strong>Está seguro ?</strong>',
      mode: 'ios',
      buttons: [
        {
          text: 'No',
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
