import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { VerfotoPage } from '../verfoto/verfoto.page';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
})
export class SeguimientoPage implements OnInit {

  itemes = [];
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

  doRefresh(event) {
    this.cargaData();  
  }

  aBuscarEncomienda() {
    if ( this.id === undefined || this.id === '' ) {
      this.funciones.msgAlert('','Digite algún número de encomienda a buscar.');
    } else {
      this.itemes = [];
      this.id_pqt = this.id;
      this.cargaData();
    }
  }

  cargaData() {
    this.cargando = true;
    //
    this.datos.servicioWEB( '/estado_pqt', { idpqt: this.id_pqt, interno: 1 } )
        .subscribe( (dev: any) => {
          this.cargando = false;
          // console.log(dev);
          if ( dev.resultado === 'ok' ) {
            //
            this.itemes = dev.datos;
            //
          } else {
            this.funciones.msgAlert('', 'No existen datos ligados a esta encomienda.');
          }
        });
  }

  async revisaFoto() {
    // ver foto del retiro
    const modal = await this.modalCtrl.create({
      component: VerfotoPage,
      componentProps: { item: {id_paquete: this.id_pqt} }
    });
    await modal.present();
    //
  }


}
