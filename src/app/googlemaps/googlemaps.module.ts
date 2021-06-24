import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GooglemapsComponent } from './googlemaps.component';

@NgModule({
    declarations: [ GooglemapsComponent ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    exports: [GooglemapsComponent,
    ]
})
export class GooglemapsModule {}