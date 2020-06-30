import { Component, HostListener } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  showInstaller = false;
  deferredPrompt: any;
  showButton = false;
  showIosInstall: boolean;
  logeado = false;

  constructor(private menuCtrl: MenuController,
              private router: Router,
              public datos: DatosService ) {}

  menuToggle() {
    this.menuCtrl.toggle();
  }

  ingresar() {
    this.router.navigateByUrl('/login');
  }

}
