import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonSegment, PopoverController } from '@ionic/angular';
import { FuncionesService } from 'src/app/services/funciones.service';
import { DatosService } from '../../services/datos.service';
import { Router } from '@angular/router';
//
import { DomSanitizer } from '@angular/platform-browser';
import { TrespuntosComponent } from '../../components/trespuntos/trespuntos.component';
import { VerfotoPage } from '../verfoto/verfoto.page';
//
@Component({
  selector: 'app-delivery-fin',
  templateUrl: './delivery-fin.page.html',
  styleUrls: ['./delivery-fin.page.scss'],
})
export class DeliveryFinPage implements OnInit {
  
  @ViewChild( IonSegment, {static: true} ) segment: IonSegment;

  @Input() item;

  segmento = 'entregaOK';
  it = [ false, false, false, false, false ];
  ot = [ false, false, false, false, false ];
  nroDocumento = '';
  foto = null;
  archivoImagen;
  queprobl = '910';
  obsProblema = '';
  receptor;
  rut;
  relacion;

  constructor(public sanitizer: DomSanitizer,
              private datos: DatosService,
              private router: Router,
              private popoverCtrl: PopoverController,
              private funciones: FuncionesService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
    this.segment.value = this.segmento;
  }

  ionViewwillEnter() {
    console.log(' ionViewwillEnter-> DeliveryFinPage');
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  segmentChanged( event ) {
    const valorSegmento = event.detail.value;
    this.segmento = valorSegmento;
  }
  
  async opcionesFoto( event ) {
    //
    const popover = await this.popoverCtrl.create({
      component: TrespuntosComponent,
      componentProps: { escliente: false },
      event,
      mode: 'ios',
      translucent: false
    });
    await popover.present();
    //
    const { data } = await popover.onDidDismiss();
    let dataParam = '';

    //
    if ( data ) {
      switch (data.opcion.texto) {
        //
        case 'Foto del retiro':
          this.revisaFoto();
          break;
        //
        case 'Tomar una foto':
          this.tomarFoto();
          break;
        //
        default:
          console.log('vacio');
          break;
      }
    }
  }

  async revisaFoto() {
    // ver foto del retiro
    const modal = await this.modalCtrl.create({
      component: VerfotoPage,
      componentProps: { item: this.item }
    });
    await modal.present();
    //
  }

  async tomarFoto() {
    // Take a photo
    await this.datos.addImage( this.item, '_delivery' );
    this.foto = this.datos.xfoto;
  }

  eliminarFoto() {
    this.foto = null;
    this.archivoImagen = null;
  }

  todoOk(): boolean {
    return ( this.it[0] === true && this.it[1] === true && this.it[2] === true && this.it[3] === true && this.it[4] === true );
  }

  entregar() {
    if ( this.todoOk() === true ) {
      // grabacion de entrega
      this.modalCtrl.dismiss({ ok:       true,
                               problema: false,
                               queprobl: this.queprobl,
                               obs:      this.item.recep_obs,
                               receptor: this.receptor,
                               rut:      this.rut,
                               relacion: this.relacion });
    } else {
      this.funciones.msgAlert( '', 'Para grabar el retiro debe dejar ticados todos los ítemes. Corrija y reintente o solo abandone.' );
    }
  }

  problemas() {
    // grabacion de entrega
    this.modalCtrl.dismiss({ ok:       true,
                             problema: true,
                             queprobl: this.queprobl,
                             obs:      this.obsProblema,
                             receptor: this.receptor,
                             rut:      this.rut,
                             relacion: this.relacion });
  }

}
