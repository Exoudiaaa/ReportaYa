import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialCamarasPage } from './historial-camaras.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialCamarasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialCamarasPageRoutingModule {}
