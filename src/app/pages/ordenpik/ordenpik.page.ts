import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-ordenpik',
  templateUrl: './ordenpik.page.html',
  styleUrls: ['./ordenpik.page.scss'],
})
export class OrdenpikPage implements OnInit {

  retiros = [];
  cargando = false;
  reordenando = false;
  reorden = false;

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
    this.datos.servicioWEB( '/misretiros', { ficha: this.datos.ficha } )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( '', 'No existen retiros pendientes asignados a ud. para desplegar.' );
            } else if ( dev.resultado === 'nodata' ) {
              this.funciones.msgAlert( '', 'No existen retiros pendientes asignados a ud. para desplegar.' );
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

  reordenar() {
    this.reordenando = !this.reordenando;
    if ( this.reorden ) {
      this.reorden = false;
      console.log('grabando reorden');
    }
  }
  reorder( event ) {
    this.reorden = true;
    const desde = event.detail.from;
    const hacia = event.detail.to;
    const itemMover = this.retiros.splice( desde, 1 )[0];
    this.retiros.splice( hacia, 0, itemMover );
    event.detail.complete();
    console.log(this.retiros[hacia].id_paquete);
    this.datos.servicioWEB( '/pickpreord', { id: this.retiros[hacia].id_paquete, orden: hacia } )
        .subscribe( (dev: any) => {
          console.log(dev);
        });
  }

  retirar( item ) {}
}
