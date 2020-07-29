import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

const IMG_URL = 'http://23.239.29.171:3055/public/img/';

@Component({
  selector: 'app-revisaracopio',
  templateUrl: './revisaracopio.page.html',
  styleUrls: ['./revisaracopio.page.scss'],
})
export class RevisaracopioPage implements OnInit {

  @Input() item;

  titulo = '';
  foto = null;
  cargando = false;

  constructor( private modalCtrl: ModalController,
               private alertCtrl: AlertController,
               private datos: DatosService ) { }

  ngOnInit() {
    this.titulo = 'Pendiente de acopiar';
    this.cargarFoto();
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  cargarFoto() {
    this.cargando = true;
    this.datos.servicioWEB( '/getimages', { id_pqt: this.item.id_paquete } )
        .subscribe( (dev: any) => {
          this.cargando = false;
          // console.log(dev);
          if ( dev.resultado === 'ok' ) {
            this.foto = IMG_URL + dev.datos[0].imgb64;
            console.log(this.foto);
          }
        });
  }

}
