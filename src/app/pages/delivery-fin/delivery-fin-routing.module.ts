import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryFinPage } from './delivery-fin.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryFinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryFinPageRoutingModule {}
