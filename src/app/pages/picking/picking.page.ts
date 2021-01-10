import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonSegment } from '@ionic/angular';
import { FuncionesService } from 'src/app/services/funciones.service';
import { DatosService } from '../../services/datos.service';
import { Router } from '@angular/router';
//
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';
//
const { Camera, Filesystem } = Plugins;
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
  queprobl = '310';
  obsProblema = '';

  constructor(public sanitizer: DomSanitizer,
              private datos: DatosService,
              private router: Router,
              private funciones: FuncionesService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
    this.segment.value = this.segmento;
  }

  ionViewwillEnter() {
    console.log(' ionViewwillEnter-> PickingPage');
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  segmentChanged( event ) {
    const valorSegmento = event.detail.value;
    //
    if ( valorSegmento === 'todos' ) {
      this.segmento = '';
      return;
    }
    //
    this.segmento = valorSegmento;
  }

  async tomarFoto( item ) {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, 
      source: CameraSource.Camera, 
      quality: 50 
    });    
    this.foto = capturedPhoto.webPath;
    //
    this.archivoImagen = await this.funciones.savePicture( capturedPhoto, item, '_pick' );
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
      // se graba la imagen en formato base64 y en paralelo el picking
      if ( this.foto !== null ) {
        // const photo = this.funciones.b64toBlob( this.foto.replace('data:image/jpeg;base64,', ''), 'image/png' );
        this.datos.uploadImage( this.archivoImagen.base64Data,
                                this.archivoImagen.imageName,
                                this.archivoImagen.formato,
                                this.item.id_paquete )
            .subscribe(( newImage ) => {
            // console.log(newImage);
          });
      }
      // grabacion de picking
      this.modalCtrl.dismiss({ ok:       true,
                               problema: false,
                               queprobl: this.queprobl,
                               obs:      this.item.obs_pickeo,
                               nroDoc:   this.nroDocumento });
    } else {
      this.funciones.msgAlert( '', 'Para grabar el retiro debe dejar ticados todos los ítemes. Corrija y reintente o solo abandone.' );
    }
  }

  problemas() {
    // se graba la imagen en formato base64 y en paralelo el picking
    if ( this.foto !== null ) {
      this.datos.uploadImage( this.archivoImagen.base64Data,
                              this.archivoImagen.imageName,
                              this.archivoImagen.formato,
                              this.item.id_paquete )
          .subscribe(( newImage ) => {
        console.log(newImage);
      });
    }
    // grabacion de picking
    this.modalCtrl.dismiss({ ok:       true,
                             problema: true,
                             queprobl: this.queprobl,
                             obs:      this.obsProblema,
                             nroDoc:   '' });
  }

}
