import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  deferredPrompt;
  showInstaller = false;

  constructor( private platform: Platform,
               private splashScreen: SplashScreen,
               private statusBar: StatusBar ) {
    this.initializeApp();
  }

  ngOnInit() {
    // ? se habra instalado ?
    window.addEventListener('appinstalled', (evt) => {
      console.log('a2hs installed');
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      setTimeout(() => this.splashScreen.hide(), 500);
    });
  }

  async revisarDarkTheme() {
    const { value } = await Storage.get({ key: 'darkmode' });
    console.log( value, (value === 'true') );
    document.body.classList.toggle( 'dark' );
  }

}
