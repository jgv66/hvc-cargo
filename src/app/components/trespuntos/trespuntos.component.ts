import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-trespuntos',
  templateUrl: './trespuntos.component.html',
  styleUrls: ['./trespuntos.component.scss'],
})
export class TrespuntosComponent {

  aDesplegar = [
    { texto: 'Foto del retiro', icon: 'eye-outline'    },
    { texto: 'Tomar una foto',  icon: 'camera-outline' }
  ];

  constructor( private popoverCtrl: PopoverController ) {}

  onClick( pos: number ) {
    this.popoverCtrl.dismiss({
      opcion: this.aDesplegar[pos]
    });
  }

}