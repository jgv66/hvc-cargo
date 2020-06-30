import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AcopiarPage } from './acopiar.page';

const routes: Routes = [
  {
    path: '',
    component: AcopiarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcopiarPageRoutingModule {}
