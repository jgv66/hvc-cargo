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
              this.funciones.msgAlert( 'ATENCION', 'No existen retiros pendientes para rescatar y desplegar.' );
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

  async revisar( item ) {
    const modal = await this.modalCtrl.create({
      component: RevisarretiroPage,
      componentProps: { item }
    });
    await modal.present();
    //
    const { data } = await modal.onWillDismiss();
    console.log( data );
    //
  }

}
