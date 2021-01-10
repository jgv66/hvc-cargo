import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryFinPageRoutingModule } from './delivery-fin-routing.module';

import { DeliveryFinPage } from './delivery-fin.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    DeliveryFinPageRoutingModule
  ],
  declarations: [DeliveryFinPage]
})
export class DeliveryFinPageModule {}
