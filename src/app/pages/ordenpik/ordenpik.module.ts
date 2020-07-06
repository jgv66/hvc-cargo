import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { OrdenpikPage } from './ordenpik.page';
import { PickingPage } from '../picking/picking.page';
import { PickingPageModule } from '../picking/picking.module';

const routes: Routes = [
  {
    path: '',
    component: OrdenpikPage
  }
];

@NgModule({
  entryComponents: [PickingPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickingPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OrdenpikPage]
})
export class OrdenpikPageModule {}
