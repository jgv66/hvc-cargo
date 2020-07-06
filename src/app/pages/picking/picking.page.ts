import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins, CameraResultType } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FuncionesService } from 'src/app/services/funciones.service';

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
  it = [ false, false, false, false, false ];

  constructor(private sanitizer: DomSanitizer,
              private funciones: FuncionesService,
              private modalCtrl: ModalController) { }

  ngOnInit() {}

  salir() {
    this.modalCtrl.dismiss();
  }

  async tomarFotoURI() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      height: 1000,
      width: 1000,
      resultType: CameraResultType.Uri
    });
    console.log('image: ', image);
    if ( image ) {
      this.foto = this.sanitizer.bypassSecurityTrustResourceUrl(image && image.webPath);
    }
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 60,
      width: 160,
      height: 120,
      allowEditing: false,
      correctOrientation: true,
      resultType: CameraResultType.Base64,
    });
    // console.log('image: ', image);
    if ( image ) {
      console.log( 'image -> ', image.base64String.length, this.funciones.lzw_encode( 'data:image/' + image.format + ';base64,' + image.base64String ).length  );
      this.imagenes[0] = { format: image.format,
                           img: this.sanitizer.bypassSecurityTrustResourceUrl( 'data:image/' + image.format + ';base64,' + image.base64String ),
                           imgb64zip: this.funciones.lzw_encode( 'data:image/' + image.format + ';base64,' + image.base64String ) };
      //
      this.foto = this.imagenes[0].img;
      //
    }
  }

  eliminarFoto() {
    this.foto = null;
    this.imagenes = [];
  }

  todoOk(): boolean {
    return ( this.it[0] === true && this.it[1] === true && this.it[2] === true && this.it[3] === true && this.it[4] === true );
  }

  retirar() {
    if ( this.todoOk() === true ) {
      this.modalCtrl.dismiss({ ok:     true,
                               fotos:  this.imagenes,
                               obs:    this.item.obs_pickeo,
                               nroDoc: this.nroDocumento });
    } else {
      this.funciones.msgAlert( '', 'Para grabar el retiro debe dejar ticados todos los ítemes. Corrija y reintente o solo abandone.' );
    }
  }

}
