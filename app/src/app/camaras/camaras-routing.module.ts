import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CamarasPage } from './camaras.page';

const routes: Routes = [
  {
    path: '',
    component: CamarasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CamarasPageRoutingModule {}
