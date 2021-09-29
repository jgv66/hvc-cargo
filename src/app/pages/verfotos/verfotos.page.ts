import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DatosService } from 'src/app/services/datos.service';
import { FuncionesService } from 'src/app/services/funciones.service';

@Component({
  selector: 'app-verfotos',
  templateUrl: './verfotos.page.html',
  styleUrls: ['./verfotos.page.scss'],
})
export class VerfotosPage implements OnInit {

  fotos = [];
  cargando = false;
  id_pqt;
  id;

  constructor( private datos: DatosService,
               private funciones: FuncionesService,
               private router: Router,
               private modalCtrl: ModalController ) {}

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }    
  }

  aBuscarFotos() {
    if ( this.id === undefined || this.id === '' ) {
      this.funciones.msgAlert('','Digite algún número de encomienda a buscar.');
    } else {
      this.fotos = [];
      this.id_pqt = this.id;
      this.cargaFotos();
    }
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
