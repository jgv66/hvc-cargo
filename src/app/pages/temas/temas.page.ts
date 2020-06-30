import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-temas',
  templateUrl: './temas.page.html',
  styleUrls: ['./temas.page.scss'],
})
export class TemasPage implements OnInit {

  darkMode = false;

  constructor( private datos: DatosService ) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    // const { value } = Plugins.Storage.get({ key: 'darkmode' });
    this.darkMode = prefersDark.matches;
  }

  ngOnInit() {}

  async cambio() {
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMode = !this.darkMode;
    document.body.classList.toggle( 'dark' );
    this.datos.guardarDato( 'darkmode', this.darkMode );
    // const { value } = await Plugins.Storage.get({ key: 'darkmode' });
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    // console.log( value, prefersDark );

  }

}
