import { Component, OnInit } from '@angular/core';
import { DatosService } from 'src/app/services/datos.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  acciones: any = [
    { title: 'Bienvenida',           url: '/home',   icon: 'home-outline',     caso: 0 },
    { title: 'Ingresar a HVC-Cargo', url: '/login',  icon: 'keypad-outline',   caso: 1 },
    {
      title: 'Encomiendas',
      children: [
        { title: 'Pendientes de retiro',   url: '/pikear',   icon: 'gift-outline'      },
        { title: 'Mis retiros pendientes', url: '/ordenpik', icon: 'analytics-outline' },
        { title: 'Entrega en acopio',      url: '/acopiar',  icon: 'business-outline'  },
      ]
    },
    {
      title: 'Ordenes de Transporte',
      children: [
        { title: 'Pendientes de Recibir',  url: '/otpendientes', icon: 'lock-open-outline'        },
        { title: 'Aceptadas',              url: '/otaceptadas',  icon: 'checkmark-circle-outline' },
        { title: 'Dar por cerrada OT',     url: '/cerrarot',     icon: 'ribbon-outline'           },
        { title: 'Cerradas',               url: '/otcerradas',   icon: 'lock-closed-outline'      },
      ]
    },
    {
      title: 'Entregas',
      children: [
        { title: 'Encomienda',  url: '/entregar', icon: 'location-outline'     },
        { title: 'Rechazos',    url: '/rechazos', icon: 'thunderstorm-outline' },
      ]
    },
    { title: 'Cerrar sesión', url: '/logout', icon: 'exit-outline',  caso: 2 }
  ];

  constructor( public datos: DatosService ) { }

  ngOnInit() {}
  tengoFicha() { return ( (this.datos.ficha) ? true : false ); }

  onoff() {
    return ( this.datos.ficha ) ? false : true;
  }

}
