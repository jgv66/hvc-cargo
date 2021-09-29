import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DatosService } from 'src/app/services/datos.service';
import { FuncionesService } from 'src/app/services/funciones.service';

@Component({
  selector: 'app-verfoto',
  templateUrl: './verfoto.page.html',
  styleUrls: ['./verfoto.page.scss'],
})
export class VerfotoPage implements OnInit {

  @Input() item;

  fotos = [];
  cargando = false;
  id_pqt;

  constructor( private datos: DatosService,
               private funciones: FuncionesService,
               private modalCtrl: ModalController ) {}

  ngOnInit() {
    this.id_pqt = this.item.id_paquete;
    this.cargaFotos();
  }

  cargaFotos() {
    this.cargando = true;
    const IMG_URL = this.datos.url + '/public/img/' ;
    const ATT_URL = this.datos.url + '/public/attach/' ;
    //
    this.datos.servicioWEB( '/getimages', { id_pqt: this.id_pqt } )
        .subscribe( (dev: any) => {
          this.cargando = false;
          if ( dev.datos[0].resultado === 'ok' ) {
            //
            dev.datos.forEach( element => { 
              //              
              if ( element.attach === true ) {
                element.imgb64 = ATT_URL + element.attach_name;
              } else {
                element.imgb64 = IMG_URL + element.imgb64;
              }
              //
            });
            //
            this.fotos = dev.datos;
            //
          } else if ( dev.datos[0].resultado === 'nodata' ) {
            this.funciones.msgAlert('', 'No existen imágenes ligadas a esta encomienda.');
          }
        });
  }

  salir() {
    this.modalCtrl.dismiss();
  }

}
