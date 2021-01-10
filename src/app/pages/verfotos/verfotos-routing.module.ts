import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerfotosPage } from './verfotos.page';

const routes: Routes = [
  {
    path: '',
    component: VerfotosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerfotosPageRoutingModule {}
