import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins, CameraResultType, CameraOptions } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FuncionesService } from 'src/app/services/funciones.service';
import { DatosService } from '../../services/datos.service';
import { Router } from '@angular/router';

const { Camera } = Plugins;

@Component({
  selector: 'app-picking',
  templateUrl: './picking.page.html',
  styleUrls: ['./picking.page.scss'],
})
export class PickingPage implements OnInit {

  @Input() item;
  nroDocumento = '';
  foto = null;
  imagenes = [];
  blobData = null;
  imgb64 = null;
  imageName = null;
  formato = null;
  it = [ false, false, false, false, false ];

  constructor(private sanitizer: DomSanitizer,
              private datos: DatosService,
              private router: Router,
              private funciones: FuncionesService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 75,
      width: 160,
      height: 120,
      allowEditing: false,
      correctOrientation: true,
      resultType: CameraResultType.Base64
    });
    // console.log('image: ', image);
    if ( image ) {
      //
      // console.log( 'image -> ', image.base64String.length, this.funciones.lzw_encode( 'data:image/' + image.format + ';base64,' + image.base64String ).length  );
      // this.imagenes[0] = { format: image.format,
      //                      img: this.sanitizer.bypassSecurityTrustResourceUrl( 'data:image/' + image.format + ';base64,' + image.base64String ),
      //                      imgb64zip: this.funciones.lzw_encode( 'data:image/' + image.format + ';base64,' + image.base64String ) };
      //
      this.foto      = this.sanitizer.bypassSecurityTrustResourceUrl( 'data:image/' + image.format + ';base64,' + image.base64String );
      // this.blobData  = this.funciones.b64toBlob( image.base64String, `image/${image.format}`);
      this.imageName = `${ this.datos.ficha }_${ this.item.id_paquete }_pick.${image.format}`;
      this.formato   = image.format;
      //
    }
  }

  eliminarFoto() {
    this.foto = null;
    this.imagenes = [];
    this.blobData = null;
    this.imageName = null;
    this.imgb64 = null;
  }

  todoOk(): boolean {
    return ( this.it[0] === true && this.it[1] === true && this.it[2] === true && this.it[3] === true && this.it[4] === true );
  }

  retirar() {
    if ( this.todoOk() === true ) {
      // se graba la imagen en formato base64 y en paralelo el picking
      this.datos.uploadImage( this.foto, this.imageName, this.formato, this.item.id_paquete )
          .subscribe(( newImage ) => {
            console.log(newImage);
          });
      // grabacion de picking
      this.modalCtrl.dismiss({ ok:     true,
                               obs:    this.item.obs_pickeo,
                               nroDoc: this.nroDocumento });
    } else {
      this.funciones.msgAlert( '', 'Para grabar el retiro debe dejar ticados todos los ítemes. Corrija y reintente o solo abandone.' );
    }
  }

}
