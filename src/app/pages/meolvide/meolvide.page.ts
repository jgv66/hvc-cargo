import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-meolvide',
  templateUrl: './meolvide.page.html',
  styleUrls: ['./meolvide.page.scss'],
})
export class MeolvidePage implements OnInit {

  solicitando = false;
  miRut = '';
  miCorreo = '';
  miTelefono = '';

  constructor( private datos: DatosService,
               private funciones: FuncionesService,
               private router: Router ) {}

  ngOnInit() {}

  validar() {
    if ( this.miRut === '' || this.miCorreo === '' || this.miTelefono === '' ) {
      this.funciones.msgAlert( '', 'Debe completar todos los datos para acceder a esta solicitud.');
    } else {
      this.solicitar();
    }
  }

  solicitar() {
    this.solicitando = true;
    this.datos.servicioWEB( '/olvidemiclave',
                            { rut:   this.miRut,
                              celu:  this.miTelefono,
                              email: this.miCorreo,
                              clave: '*p3d1r*m1*cl4v3*' } )
        .subscribe( dev => this.revisaRespuestaCambio( dev ) );
  }
  revisaRespuestaCambio( dev ) {
    this.solicitando = false;
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( '', dev.mensaje );
    } else {
      this.funciones.msgAlert( '', 'La solicitud para recuperar su clave fue enviada con exito. Debe esperar el mensaje o llamado de RRHH.' );
      this.router.navigate(['/home']);
    }
  }

}
