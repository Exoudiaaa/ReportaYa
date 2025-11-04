import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleasignacionPage } from './detalleasignacion.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleasignacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleasignacionPageRoutingModule {}
