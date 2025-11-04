import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsignacionesPage } from './asignaciones.page';

const routes: Routes = [
  {
    path: '',
    component: AsignacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsignacionesPageRoutingModule {}
