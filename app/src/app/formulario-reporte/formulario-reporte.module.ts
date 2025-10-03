import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormularioReportePageRoutingModule } from './formulario-reporte-routing.module';

import { FormularioReportePage } from './formulario-reporte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormularioReportePageRoutingModule
  ],
  declarations: [FormularioReportePage]
})
export class FormularioReportePageModule {}
