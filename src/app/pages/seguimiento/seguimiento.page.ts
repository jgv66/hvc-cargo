import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { VerfotoPage } from '../verfoto/verfoto.page';
import { PrintService } from '../../services/printer.service';

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
               private printer: PrintService,
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
          console.log(dev);
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

  ImprimeEncomienda( item ) {
    // console.log( item.id_paquete )
    this.datos.servicioWEB( '/unpaquete', { idpqt: item.id_paquete } )
        .subscribe( (dev: any) => {
          if ( dev.resultado === 'ok' ) {
            //
            console.log(dev.datos[0]);
            this.printer.ImprimirPicking( dev.datos[0] );
            //
          } else {
            this.funciones.msgAlert('', 'No existen datos ligados a esta encomienda.');
          }
        });    
  }

}
