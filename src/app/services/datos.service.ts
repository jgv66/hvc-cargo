import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plugins, CameraResultType, CameraSource, CameraOptions } from '@capacitor/core';
//
const { Camera } = Plugins;
//
import { SERVER_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  url = SERVER_URL;     // 'http://23.239.29.171:3070';
  ficha: string;        // numero de ficha del usuario dentro de softland
  nombre: string;       // nombre del usuario en softland
  email: string;        // email del usuario en softland
  idempresa: number;    // id de la empresa 1,2,3...
  nombreemp: string;    // nombre de la empresa
  xfoto;
  logeado = false;

  constructor( private http: HttpClient ) {
    this.logeado = false;
  }

  servicioWEB( cSP: string, parametros?: any ) {
    const url    = this.url + cSP;
    const body   = parametros;
    return this.http.post( url, body );
  }

  // set a key/value
  async guardarDato( key, value ) {
    await Plugins.Storage.set({ key, value });
  }

  async leerDato( key ) {
    const { value } = await Plugins.Storage.get({ key });
    return value;
  }

  uploadImageBlob(blobData, name, ext, idPaquete) {
    //
    const url = this.url + '/imgUp';
    //
    const formData = new FormData();
    formData.append('kfoto', blobData, name );
    formData.append('name',      name);
    formData.append('extension', ext);
    formData.append('id_pqt',    idPaquete );    
    //
    return this.http.post( url, formData );
    //
  }

  async addImage( item, alias ) {
    //
    this.xfoto = undefined;
    //
    const image = await Camera.getPhoto({
      quality: 40,
      allowEditing: false,
      saveToGallery: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera, 
    }).catch( err => {
      console.log('cancelado');
    });
    //
    if ( image ) {
      //
      this.xfoto = 'data:image/jpeg;base64,'+ image.base64String;
      //
      const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
      const imageName = item.id_paquete + alias +'.'+ image.format ;
      //
      this.uploadImageBlob( blobData, imageName, image.format, item.id_paquete )
      .subscribe((newImage) => {
        console.log(newImage);
      });
    }
  }
 
  // Helper function
  // https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
 
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
 
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
 
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
 
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

}
