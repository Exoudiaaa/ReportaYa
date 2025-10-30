import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartesPage } from './partes.page';

const routes: Routes = [
  {
    path: '',
    component: PartesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartesPageRoutingModule {}
