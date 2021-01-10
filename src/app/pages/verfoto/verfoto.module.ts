import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerfotoPageRoutingModule } from './verfoto-routing.module';

import { VerfotoPage } from './verfoto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerfotoPageRoutingModule
  ],
  declarations: [VerfotoPage]
})
export class VerfotoPageModule {}
