import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, MenuController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  miEmail = '';
  miClave = '';
  cargando = false;

  constructor(private router: Router,
              private menuCtrl: MenuController,
              public datos: DatosService,
              private funciones: FuncionesService ) {}

  ngOnInit() {
    this.datos.leerDato( 'ks_usuario' )
        .then( dato => {
          try {
            if ( dato ) {
              this.miEmail   = dato;
              this.miClave = '';
            } else {
              this.miEmail = '';
              this.miClave = '';
            }
          } catch (error) {
            this.miEmail = '';
            this.miClave = '';
        }
        });
  }

  menuToggle() {
    this.menuCtrl.toggle();
  }

  volver() {
    this.router.navigate(['/home']);
  }

  login() {
    this.cargando = true;
    const pssw = window.btoa( this.miClave );
    // console.log(this.miClave, pssw);
    this.datos.servicioWEB( '/usr', { email: this.miEmail.toLowerCase(), clave: pssw } )
        .subscribe( dev => { this.revisaRespuesta( dev ); });
  }
  revisaRespuesta( dev ) {
    this.cargando = false;
    //
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos );
    } else if ( dev.datos[0].resultado === false ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      //
      if ( dev.datos[0].primeravez ) {
        // tslint:disable-next-line: quotemark
        this.funciones.msgAlert('', "Por su seguridad, la primera acción dentro de HVC-Cargo debe ser cambiar su clave de acceso. Será direccionado hacia 'Cambiar mi clave'.");
        this.router.navigate(['/cambioclave']);
        //
      } else {
        //
        this.datos.ficha     = dev.datos[0].id;
        this.datos.nombre    = dev.datos[0].nombre;
        this.datos.email     = dev.datos[0].email;
        this.datos.nombreemp = dev.datos[0].nombreemp;
        //
        this.datos.guardarDato( 'ks_usuario', this.miEmail );
        //
        this.datos.logeado = true;
        this.router.navigate(['/home']);
        this.funciones.muestraySale( this.funciones.textoSaludo() + this.datos.nombre, 1, 'middle' );
      }
      //
    }
  }

  iforgot() {
    this.router.navigate(['/meolvide']);
  }

}
