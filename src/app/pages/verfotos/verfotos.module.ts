import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerfotosPageRoutingModule } from './verfotos-routing.module';

import { VerfotosPage } from './verfotos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerfotosPageRoutingModule
  ],
  declarations: [VerfotosPage]
})
export class VerfotosPageModule {}
