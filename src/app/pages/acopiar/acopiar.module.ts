import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AcopiarPageRoutingModule } from './acopiar-routing.module';

import { AcopiarPage } from './acopiar.page';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    AcopiarPageRoutingModule
  ],
  declarations: [AcopiarPage]
})
export class AcopiarPageModule {}
