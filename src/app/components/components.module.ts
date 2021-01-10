import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';
import { TrespuntosComponent } from './trespuntos/trespuntos.component';

@NgModule({
  declarations: [MenuComponent,TrespuntosComponent],
  exports: [MenuComponent,TrespuntosComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ]
})
export class ComponentsModule { }
