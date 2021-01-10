import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerfotoPage } from './verfoto.page';

const routes: Routes = [
  {
    path: '',
    component: VerfotoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerfotoPageRoutingModule {}
