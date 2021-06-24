import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonSegment } from '@ionic/angular';
import { FuncionesService } from 'src/app/services/funciones.service';
import { DatosService } from '../../services/datos.service';
import { Router } from '@angular/router';
//
import { DomSanitizer } from '@angular/platform-browser';
//
@Component({
  selector: 'app-picking',
  templateUrl: './picking.page.html',
  styleUrls: ['./picking.page.scss'],
})
export class PickingPage implements OnInit {

  @ViewChild( IonSegment, {static: true} ) segment: IonSegment;

  @Input() item;

  segmento = 'retiroOK';
  it = [ false, false, false, false, false ];
  nroDocumento = '';
  foto = null;
  archivoImagen;
  obsProblema = '';
  //
  calculando = false;
  queTipo = 'bulto';
  bulto   = true;
  cantidad;
  alto;
  ancho;
  largo;
  peso;
  pallet;
  //
  precio = 0;

  constructor(public sanitizer: DomSanitizer,
              private datos: DatosService,
              private router: Router,
              private funciones: FuncionesService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
    this.segment.value  = this.segmento;
    this.cantidad       = this.item.bultos;
    // 
    // console.log(this.item);
    // 
  }

  ionViewwillEnter() {
    // console.log(' ionViewwillEnter-> PickingPage');
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  segmentChanged( event ) {
    const valorSegmento = event.detail.value;
    this.segmento = valorSegmento;
  }

  segmentChangedTipo( event ) {
    // console.log('segmentChangedTipo->',event.detail);
    const valorSegmento = event.detail.value;
    this.queTipo = valorSegmento;
  }

  solicitarCalculo() {
    this.precio = 0;
    // 
    if ( this.queTipo === 'pallet' && ( this.pallet === undefined || this.pallet <= 0 ) ) {
      this.funciones.msgAlert('PALLET','No existen datos para recalcular el precio de la encomienda.')
      return;
    }
    if ( this.queTipo === 'bulto' && ( this.cantidad === undefined || this.cantidad <= 0 || 
                                       this.alto === undefined || this.alto <= 0 || 
                                       this.ancho === undefined ||  this.ancho <= 0 || 
                                       this.largo === undefined || this.largo <= 0 || 
                                       this.peso === undefined || this.peso <= 0 ) ) {
      this.funciones.msgAlert('BULTO/PESO','No existen datos para recalcular el precio de la encomienda.')
      return;
    }
    this.datos.servicioWEB( '/recalculo',
                            { bulto:    this.queTipo,
                              cantidad: this.cantidad,
                              alto:     this.alto,
                              ancho:    this.ancho,
                              largo:    this.largo,
                              peso:     this.peso,
                              pallet:   this.pallet } )
      .subscribe( (dev: any) => {
        console.log(dev);
        if ( dev.resultado === 'ok' ) {
          //
          this.precio = dev.datos;
          //
        } else {
          this.funciones.msgAlert('', dev.datos);
        }
      });
  }

  cambiarPrecio() {
    this.datos.servicioWEB( '/cambiaprecio',
                            { id_pqt:  this.item.id_paquete,
                              precio:  this.precio,
                              peso:    this.peso,
                              bultos:  this.cantidad,
                              volumen: (this.alto * this.ancho * this.largo) / 1000000 } )
      .subscribe( (dev: any) => {
        console.log(dev)
        if ( dev.resultado === 'ok' ) {
          // actualizar el array
          this.item.valor_cobrado = this.precio;
          this.item.bultos        = this.cantidad;
          this.item.peso          = this.peso;
          this.item.volumen       = (this.alto * this.ancho * this.largo) / 1000000;
          // 
          this.funciones.muestraySale('Precio de la encomienda ha cambiado',2,'middle');
          this.segmento = 'retiroOK';
          //
        } else {
          this.funciones.msgAlert('', dev.datos);
        }
      });
  }

  async tomarFoto( item ) {
    // Take a photo
    await this.datos.addImage( this.item, '_pick' );
    this.foto = this.datos.xfoto;
  }

  eliminarFoto() {
    this.foto = null;
    this.archivoImagen = null;
  }

  todoOk(): boolean {
    return ( this.it[0] === true && this.it[1] === true && this.it[2] === true && this.it[3] === true && this.it[4] === true );
  }

  retirar() {
    if ( this.todoOk() === true ) {
      // grabacion de picking
      this.modalCtrl.dismiss({ ok:       true,
                               problema: false,
                               queprobl: '',
                               obs:      this.item.obs_pickeo,
                               nroDoc:   this.nroDocumento });
    } else {
      this.funciones.msgAlert( '', 'Para grabar el retiro debe dejar ticados todos los ítemes. Corrija y reintente o solo abandone.' );
    }
  }

}
