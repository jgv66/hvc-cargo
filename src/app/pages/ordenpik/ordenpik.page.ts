import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { PickingPage } from '../picking/picking.page';

@Component({
  selector: 'app-ordenpik',
  templateUrl: './ordenpik.page.html',
  styleUrls: ['./ordenpik.page.scss'],
})
export class OrdenpikPage implements OnInit {

  retiros = [];
  grabando = false;
  cargando = false;
  reordenando = false;
  reorden = false;
  foto = null;

  constructor( public datos: DatosService,
               private funciones: FuncionesService,
               private router: Router,
               private alertCtrl: AlertController,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }
  ionViewWillEnter() {
    this.cargarDatos();
  }
  cargarDatos( event? ) {
    this.cargando = true;
    this.datos.servicioWEB( '/misretiros', { ficha: this.datos.ficha } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( '', 'No existen retiros pendientes para desplegar.' );
            } else if ( dev.resultado === 'nodata' ) {
              this.funciones.msgAlert( '', 'No existen retiros pendientes para desplegar.' );
            } else {
              this.retiros = dev.datos;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          this.funciones.msgAlert( 'ATENCION', error );
        });
  }
  doRefresh( event ) {
    this.cargarDatos( event );
  }

  async reordenar() {
    this.reordenando = !this.reordenando;
    if ( this.reorden ) {
      this.reorden = false;
      const alert = await this.alertCtrl.create({
        header: 'Nuevo orden...',
        message: 'Desea grabar este orden para sus pendientes de retiro?',
        mode: 'ios',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {}
          }, {
            text: 'Sí, me agrada',
            handler: () => { this.guardaOrden(); }
          }
        ]
      });
      await alert.present();
    }
  }
  guardaOrden() {
    const newOrder = [];
    let pos = 1;
    this.retiros.forEach( item => {
      newOrder.push( { id: item.id_paquete, orden: pos } );
      ++pos;
    });
    // console.log(newOrder);
    this.datos.servicioWEB( '/pickpreord', { orden: newOrder } )
      .subscribe( (dev: any) => {
        // console.log(dev);
        if ( dev.resultado === 'ok') {
          this.funciones.muestraySale('Guardado en orden', 0.5, 'middle');
        }
      });
  }
  reorder( event ) {
    this.reorden = true;
    const desde = event.detail.from;
    const hacia = event.detail.to;
    const itemMover = this.retiros.splice( desde, 1 )[0];
    this.retiros.splice( hacia, 0, itemMover );
    event.detail.complete();
  }

  async retirar( item, pos ) {
    const modal = await this.modalCtrl.create({
      component: PickingPage,
      componentProps: { item }
    });
    await modal.present();
    //
    const { data } = await modal.onWillDismiss();
    // console.log(data);
    if ( data ) {
      this.grabando = true;
      //
      this.datos.servicioWEB( '/pickeado', { ficha:  this.datos.ficha,
                                             id_pqt: item.id_paquete,
                                             obs:    data.obs,
                                             nroDoc: data.nroDoc } )
        .subscribe( (dev: any) => {
            this.grabando = false;
            if ( dev.resultado === 'ok' ) {
              this.retiros.splice( pos, 1 );
              this.funciones.muestraySale( 'Retiro exitoso.', 1, 'middle' );
              // this.rescatar(item);
            } else {
              this.funciones.msgAlert('', dev.datos);
            }
        });
    }
  }

  rescatar(item) {
    this.datos.servicioWEB( '/getimages', { id_pqt: item.id_paquete } )
      .subscribe( (dev: any) => {
        console.log('/getimages', dev);
        const datos = JSON.parse( dev.datos );
        console.log(datos);
        console.log(datos[0].imgb64.lenght);
        this.foto = datos[0].imgb64;
      });
  }

}
