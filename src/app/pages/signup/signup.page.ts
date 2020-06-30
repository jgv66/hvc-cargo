import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatosService } from 'src/app/services/datos.service';
import { FuncionesService } from 'src/app/services/funciones.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {

  miRut    = '';
  miClave1 = '';
  miClave2 = '';
  miClaveActual = '';
  cargando = false;
  passwordType = 'password';

  constructor( public datos: DatosService,
               private router: Router,
               private funciones: FuncionesService) { }

  togglePasswordMode() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
  }

  registrar() {
    if ( this.miClave1 === '' || this.miClaveActual === '' ) {
      this.funciones.msgAlert( '', 'No puede validar con claves vacías', 'Correja y reintente.' );
    } else if ( this.miClave1.length < 6 ) {
      this.funciones.msgAlert( '', 'El largo de su clave debe ser mayor o igual a 6 caracteres. Corrija y reintente.' );
    } else {
      this.cargando = true;
      this.datos.servicioWEB( '/cambiarClave', { rut: this.miRut, claveActual: this.miClaveActual, clave: this.miClave1 } )
          .subscribe( dev => this.revisaRespuesta( dev ) );
    }

  }
  revisaRespuesta( dev ) {
    this.cargando = false;
    // console.log(dev);
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ERROR', dev.datos );
    } else  {
      this.funciones.msgAlert( '', dev.datos[0].mensaje + ' Ingrese con la nueva clave.' );
      this.router.navigate(['/home']);
    }
  }

}
