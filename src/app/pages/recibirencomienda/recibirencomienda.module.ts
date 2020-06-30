import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { RecibirencomiendaPage } from './recibirencomienda.page';

// import { RevisarretiroPageModule } from '../revisarretiro/revisarretiro.module';
// import { RevisarretiroPage } from '../revisarretiro/revisarretiro.page';

const routes: Routes = [
  {
    path: '',
    component: RecibirencomiendaPage
  }
];

@NgModule({
  // entryComponents: [ RevisarretiroPage ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // RevisarretiroPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RecibirencomiendaPage]
})
export class RecibirencomiendaPageModule {}
