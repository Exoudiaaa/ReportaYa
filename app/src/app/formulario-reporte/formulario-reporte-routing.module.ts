import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormularioReportePage } from './formulario-reporte.page';

const routes: Routes = [
  {
    path: '',
    component: FormularioReportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormularioReportePageRoutingModule {}
