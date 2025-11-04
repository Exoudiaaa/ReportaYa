import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleasignacionPageRoutingModule } from './detalleasignacion-routing.module';

import { DetalleasignacionPage } from './detalleasignacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleasignacionPageRoutingModule
  ],
  declarations: [DetalleasignacionPage]
})
export class DetalleasignacionPageModule {}
