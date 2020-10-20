import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { RevisarretiroPage } from '../revisarretiro/revisarretiro.page';

@Component({
  selector: 'app-recibirencomienda',
  templateUrl: './recibirencomienda.page.html',
  styleUrls: ['./recibirencomienda.page.scss'],
})
export class RecibirencomiendaPage implements OnInit {

  retiros = [];
  cargando = false;
  reordenando = false;

  constructor( public datos: DatosService,
               private funciones: FuncionesService,
               private router: Router,
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
    this.datos.servicioWEB( '/pickpend', { ficha: this.datos.ficha } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( 'ATENCION', 'No existen retiros pendientes.' );
            } else if ( dev.resultado === 'nodata' ) {
                this.funciones.msgAlert( '', 'No existen retiros pendientes.' );
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

  async revisar( item, pos ) {
    const modal = await this.modalCtrl.create({
      component: RevisarretiroPage,
      componentProps: { item, titulo: '(#' + item.id_paquete.toString() + ') Sin retirar' }
    });
    await modal.present();
    //
    const { data } = await modal.onWillDismiss();
    if ( data ) {
      this.cargando = true;
      this.datos.servicioWEB( '/yoLoRetiro', { ficha: this.datos.ficha, id: item.id_paquete } )
          .subscribe( (dev: any) => {
            this.cargando = false;
            // console.log(dev);
            if ( dev.resultado === 'ok' ) {
              this.retiros.splice( pos, 1 );
              this.funciones.muestraySale( dev.datos[0].mensaje, 1, 'middle' );
            } else {
              this.funciones.msgAlert('', dev.datos);
            }
          });
     }
    //
  }

}
