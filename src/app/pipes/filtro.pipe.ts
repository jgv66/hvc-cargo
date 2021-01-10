import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {

  transform(arreglo: any[], texto: string ): unknown {

    if ( texto === '' || texto === undefined || !arreglo ) {
      return arreglo;
    }

    texto = texto.toLowerCase();

    return arreglo.filter( 
      item => item.cli_razon.toLowerCase().includes( texto ) ||
              item.cli_direccion.toLowerCase().includes( texto ) ||
              item.des_razon.toLowerCase().includes( texto ) ||
              item.des_direccion.toLowerCase().includes( texto ) ||
              item.id_paquete === parseInt(texto)
      );
  }

}
