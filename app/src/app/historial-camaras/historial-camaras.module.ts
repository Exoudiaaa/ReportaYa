import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialCamarasPageRoutingModule } from './historial-camaras-routing.module';

import { HistorialCamarasPage } from './historial-camaras.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialCamarasPageRoutingModule
  ],
  declarations: [HistorialCamarasPage]
})
export class HistorialCamarasPageModule {}
