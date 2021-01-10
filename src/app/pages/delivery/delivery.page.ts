import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DatosService } from 'src/app/services/datos.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { DeliveryFinPage } from '../delivery-fin/delivery-fin.page';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit {

  entregas = [];
  cargando = false;
  textoBuscar;
  grabando = false;

  constructor( private datos: DatosService,
               private router: Router,
               private modalCtrl: ModalController,
               private funciones: FuncionesService) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }
  ionViewWillEnter() {
    this.cargarDatos();
  }

  onSearchCange( event ) {
    this.textoBuscar = event.detail.value;
  }

  doRefresh( event ) {
    this.cargarDatos( event );
  }

  cargarDatos( event? ) {
    this.cargando = true;
    this.datos.servicioWEB( '/entregar', { ficha: this.datos.ficha } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( 'ATENCION', 'No existen entregas pendientes.' );
            } else if ( dev.resultado === 'nodata' ) {
                this.funciones.msgAlert( '', 'No existen entregas pendientes.' );
            } else {
              this.entregas = dev.datos;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          this.funciones.msgAlert( 'ATENCION', error );
        });
  }

  async revisar( item, pos ) {
    const modal = await this.modalCtrl.create({
      component: DeliveryFinPage,
      componentProps: { item }
    });
    await modal.present();
    //
    const { data } = await modal.onWillDismiss();
    // console.log(data);
    if ( data ) {
      this.grabando = true;
      //
      this.datos.servicioWEB( '/entregado', { ficha:    this.datos.ficha,
                                              problema: data.problema,
                                              queprobl: data.queprobl,
                                              id_pqt:   item.id_paquete,
                                              receptor: data.receptor,   // datos alternativos
                                              rut:      data.rut,        // datos alternativos
                                              relacion: data.parentezco, // datos alternativos
                                              obs:      data.obs,
                                              nroDoc:   data.nroDoc } )
        .subscribe( (dev: any) => {
            this.grabando = false;
            if ( dev.resultado === 'ok' ) {
              this.entregas.splice( pos, 1 );
              this.funciones.muestraySale( 'Entrega se grabó.', 1, 'middle' );
            } else {
              this.funciones.msgAlert('', dev.datos);
            }
        });
    }
  }
  
}
