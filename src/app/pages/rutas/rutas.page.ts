import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { GooglemapsComponent } from '../../googlemaps/googlemaps.component';

import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
})
export class RutasPage implements OnInit {
  //
  itemes = [];
  cargando = false;
  id_pqt;
  id;
  item;
  miPosicion;
  //
  constructor( private datos: DatosService,
               private funciones: FuncionesService,
               private router: Router,
               private modalCtrl: ModalController ) {
    this.ubicameAhora();
  }

  async ubicameAhora() {
    Geolocation.getCurrentPosition()
      .then( (res) => {
          this.miPosicion = { lat: res.coords.latitude,  lng: res.coords.longitude };
      });
  }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }    
  }

  aBuscarEncomienda() {
    if ( this.id === undefined || this.id === '' ) {
      this.funciones.msgAlert('','Digite algún número de encomienda a buscar.');
    } else {
      this.cargando = true;
      //
      this.datos.servicioWEB( '/unpaquete', { idpqt: this.id } )
        .subscribe( (dev: any) => {
          if ( dev.resultado === 'ok' ) {
            //
            console.log(dev.datos[0]);
            this.cargando = false;
            this.item = dev.datos[0];
            //
          }
            //
        });
    }
  }

  async goTo( destino ) {
    const modalAdd = await this.modalCtrl.create({
      component: GooglemapsComponent,
      mode: 'ios',
      swipeToClose: true,
      componentProps: { position: this.miPosicion }
    });
    await modalAdd.present();
    //
    const {data} = await modalAdd.onWillDismiss();
    if (data) {
      console.log('data =>',data);
      this.miPosicion = data.pos;
    }
  }

}