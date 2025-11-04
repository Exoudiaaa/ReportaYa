import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsignacionesPageRoutingModule } from './asignaciones-routing.module';

import { AsignacionesPage } from './asignaciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsignacionesPageRoutingModule
  ],
  declarations: [AsignacionesPage]
})
export class AsignacionesPageModule {}
