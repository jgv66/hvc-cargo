import { Component, OnInit, Input, Renderer2, ElementRef, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { GooglemapsService } from './googlemaps.service';
import { ModalController } from '@ionic/angular';

import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

declare var google;

@Component({
  selector: 'app-googlemaps',
  templateUrl: './googlemaps.component.html',
  styleUrls: ['./googlemaps.component.scss'],
})
export class GooglemapsComponent implements OnInit {
  
  @Input() position;
  label = { titulo: 'Ubicación',
            subtitulo: 'Mi ubicación de envío' };
  map: any;
  marker: any;
  infoWindow: any;
  positionSet: any;
  
  @ViewChild('map') divMap: ElementRef;

  constructor( private renderer: Renderer2,
               @Inject(DOCUMENT) private document,
               private googlemapsservice: GooglemapsService,
               public modalCtrl: ModalController ) {}

  ngOnInit() {
    this.init();
  }
  // ionViewDidLoad() {
  //     google.maps.event.trigger(this.map,'resize');
  // }

  async init() {
    this.googlemapsservice.init( this.renderer, this.document )
      .then( () => {
        this.initMap();
      })
      .catch( (err) => {
        console.log(err);
      });
  }

  initMap() {

    console.log( 'GooglemapsComponent.initMap()->', this.position );

    const position = this.position;

    let latlng = new google.maps.LatLng( position.lat, position.lng );

    let mapOptions = {
      center: latlng,
      zoom: 15,
      disableDefaultUI: true,
      clickableIcons: false,
    };

    this.map = new google.maps.Map( this.divMap.nativeElement, mapOptions );
    this.marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        draggable: true,
    });

    this.clickHandleEvent();

    this.infoWindow = new google.maps.InfoWindow();
    if ( this.label.titulo.length) {
        this.addMarker(position);
        this.setInfoWindow( this.marker, this.label.titulo, this.label.subtitulo);
    }
    // google.maps.event.trigger(this.map,'resize');
  }

  clickHandleEvent() {

    this.map.addListener( 'click', (event:any) => {

      const position = {
        lat: event.latLng.lat(), 
        lng: event.latLng.lng() 
      };
      this.addMarker( position );

    })

  }

  addMarker( position: any ): void {
    let latlng = new google.maps.LatLng( position.lat, position.lng );
    //
    this.marker.setPosition( latlng );
    //
    this.map.panTo( position );
    this.positionSet = position;
  }

  setInfoWindow( marker: any, titulo: string, subtitulo: string ): void {
    //
    const contentString = `<div id="contentInsideMap">
                            <div></div>
                            <p style="font-weight:bold;margin-bottom:5px;">${ titulo }</p>
                            <div id="bodyContent">
                              <p class="normal m-0">${subtitulo}</p>
                            </div>
                           </div>`;
    this.infoWindow.setContent( contentString );
    this.infoWindow.open( this.map, marker );
    //
  }

  async mylocation() {
    // console.log('my location click');
    Geolocation.getCurrentPosition().then( (res) => {
      // console.log('mylocation() => get');
      const position = { lat: res.coords.latitude, lng: res.coords.longitude };
      this.addMarker( position );
    })
  }

  aceptar() {
    // console.log('click en aceptar ->', this.positionSet );
    this.modalCtrl.dismiss({ pos: this.positionSet });
  }

}
