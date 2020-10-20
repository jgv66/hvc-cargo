import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonSegment } from '@ionic/angular';
import { Plugins, CameraResultType, CameraSource, FilesystemDirectory, Capacitor } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FuncionesService } from 'src/app/services/funciones.service';
import { DatosService } from '../../services/datos.service';
import { Router } from '@angular/router';

const { Camera, Filesystem } = Plugins;

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
  imageName = null;
  formato = null;
  queprobl = '310';
  obsProblema = '';

  constructor(private sanitizer: DomSanitizer,
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

  async tomarFoto() {
    //
    const opciones = { quality: 50,
                       source: CameraSource.Camera,
                       resultType: CameraResultType.Uri,
                       correctOrientation: true,
                       width: 320,
                       allowEditing: false };
    const originalPhoto = await Camera.getPhoto(opciones);
    const photoInTempStorage = await Filesystem.readFile({ path: originalPhoto.path });

    const date = new Date();
    const time = date.getTime();
    const fileName = time + '.jpeg';

    await Filesystem.writeFile({
      data: photoInTempStorage.data,
      path: fileName,
      directory: FilesystemDirectory.Data
    });

    const finalPhotoUri = await Filesystem.getUri({
      directory: FilesystemDirectory.Data,
      path: fileName
    });

    const photoPath = Capacitor.convertFileSrc(finalPhotoUri.uri);
    console.log(photoPath);

    if ( originalPhoto ) {
      // const blobData = this.funciones.b64toBlob(image.base64String, `image/${image.format}`);
      // this.foto      = this.sanitizer.bypassSecurityTrustResourceUrl( 'data:image/' + image.format + ';base64,' + image.base64String );
      // this.imageName = `${ this.datos.ficha }_${ this.item.id_paquete }_pick.${image.format}`;
      // this.formato   = image.format;
      this.foto      = this.sanitizer.bypassSecurityTrustResourceUrl( photoPath );
      this.imageName = `${ this.datos.ficha }_${ this.item.id_paquete }_pick.${originalPhoto.format}`;
      this.formato   = originalPhoto.format;
      //
    }

  }

  eliminarFoto() {
    this.foto = null;
    this.imageName = null;
    this.formato = null;
  }

  problemas() {
    // se graba la imagen en formato base64 y en paralelo el picking
    if ( this.foto !== null ) {
      this.datos.uploadImage( this.foto, this.imageName, this.formato, this.item.id_paquete )
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

  todoOk(): boolean {
    return ( this.it[0] === true && this.it[1] === true && this.it[2] === true && this.it[3] === true && this.it[4] === true );
  }

  retirar() {
    if ( this.todoOk() === true ) {
      // se graba la imagen en formato base64 y en paralelo el picking
      if ( this.foto !== null ) {
        // const photo = this.funciones.b64toBlob( this.foto.replace('data:image/jpeg;base64,', ''), 'image/png' );
        this.datos.uploadImage( this.foto, this.imageName, this.formato, this.item.id_paquete )
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

}
