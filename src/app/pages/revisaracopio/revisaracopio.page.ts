import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { PrintService } from '../../services/printer.service';
import { DomSanitizer } from '@angular/platform-browser'; 

const IMG_URL = 'http://23.239.29.171:3055/public/img/';

@Component({
  selector: 'app-revisaracopio',
  templateUrl: './revisaracopio.page.html',
  styleUrls: ['./revisaracopio.page.scss'],
})
export class RevisaracopioPage implements OnInit {

  @Input() item;

  titulo = '';
  fotos = [];
  cargando = false;

  constructor( private modalCtrl: ModalController,
               private printer: PrintService,
               private datos: DatosService,
               public domSanitizer: DomSanitizer ) { }

  ngOnInit() {
    this.titulo = 'Sin acopiar';
    this.printer.listPrinter();
    // this.cargarFoto();
  }

  ImprimeEncomienda() {
    this.printer.ImprimeEncomienda( this.item );
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  cargarFoto() {
    this.cargando = true;
    this.datos.servicioWEB( '/getimages', { id_pqt: this.item.id_paquete } )
        .subscribe( (dev: any) => {
          console.log(dev);
          this.cargando = false;
          if (dev.resultado === 'ok') {
            //
            dev.datos.forEach( element => { 
              element.imgb64 = IMG_URL + element.imgb64; 
            });
            //
            this.fotos = dev.datos;
            //
          }
        });
  }

}
