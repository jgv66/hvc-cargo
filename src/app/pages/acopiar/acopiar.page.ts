import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { RevisaracopioPage } from '../revisaracopio/revisaracopio.page';

@Component({
  selector: 'app-acopiar',
  templateUrl: './acopiar.page.html',
  styleUrls: ['./acopiar.page.scss'],
})
export class AcopiarPage implements OnInit {

  acopios = [];
  cargando = false;
  reordenando = false;
  buscando = false;
  textoBuscar;

  constructor( public datos: DatosService,
               private funciones: FuncionesService,
               private router: Router,
               private modalCtrl: ModalController,
               private alertCtrl: AlertController ) { }

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

  cargarDatos( event? ) {
    this.cargando = true;
    this.datos.servicioWEB( '/acopiar', { ficha: this.datos.ficha } )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( 'ATENCION', 'No existen itemes para acopiar.' );
            } else if ( dev.resultado === 'nodata' ) {
                this.funciones.msgAlert( '', 'No existen acopios pendientes.' );
            } else {
              this.acopios = dev.datos;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          this.cargando = false;
          console.log(error);
          this.funciones.msgAlert( '', error );
        });
  }

  doRefresh( event ) {
    this.cargarDatos( event );
  }

  async revisar( item, pos ) {
    const modal = await this.modalCtrl.create({
      component: RevisaracopioPage,
      componentProps: { item }
    });
    await modal.present();
    //
    const { data } = await modal.onWillDismiss();
    if ( data ) {
      this.cargando = true;
      this.datos.servicioWEB( '/yoLoRetiro', { ficha: this.datos.ficha, id: item.id_paquete } )
          .subscribe( (dev: any) => {
            this.cargando = false;
            console.log(dev);
            if ( dev.resultado === 'ok' ) {
              this.acopios.splice( pos, 1 );
              this.funciones.muestraySale( dev.datos[0].mensaje, 1, 'middle' );
            } else {
              this.funciones.msgAlert('', dev.datos);
            }
          });
     }
    //
  }

  async preguntaAcopiar( item ) {
    console.log(item);
    const alert = await this.alertCtrl.create({
      header: 'ACOPIAR',
      message: 'Desea dejar esta encomienda en el sector de acopios?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        },
        {
          text: 'Sí, acopie',
          handler: () => {
            this.acopiar(item);
          }
        }
      ]
    });
    await alert.present();
  }

  acopiar(item) {
    this.cargando = true;
    this.datos.servicioWEB( '/dejaracopiada', { ficha: this.datos.ficha, idpqt: item.id_paquete } )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( 'ATENCION', 'No existen itemes para acopiar.' );
            } else if ( dev.resultado === 'nodata' ) {
                this.funciones.msgAlert( '', 'No existen acopio.' );
            } else {
              this.funciones.muestraySale(dev.datos[0].mensaje,1,'middle');
              this.cargarDatos();
            }
        },
        (error) => {
          this.cargando = false;
          console.log(error);
          this.funciones.msgAlert( '', error );
        });    
  }

}