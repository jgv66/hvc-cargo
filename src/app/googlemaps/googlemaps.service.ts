import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GooglemapsService {

  apiKey = environment.apiKey;
  mapsLoaded = false;

  constructor() { }

  init( renderer: any, document: any ) {

    return new Promise( (resolve) => {

      if ( this.mapsLoaded ) {
        // console.log('google is preview loaded');
        resolve( true );
        return;
      }

      const script = renderer.createElement('script');
      script.id = 'googleMaps';

      window['mapInit'] = () => {
        this.mapsLoaded = true;
        if ( google ) {
          console.log('2. google esta cargado');
        } else {
          console.log('3. google no esta definido');
        }
        resolve( true );
        return;
      }

      if ( this.apiKey ) {
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey +'&callback=mapInit'; 
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?&callback=mapInit'; 
      }

      renderer.appendChild( document.body, script );

    });

  }


}
