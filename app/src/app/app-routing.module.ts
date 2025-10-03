import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },  {
    path: 'reportar',
    loadChildren: () => import('./reportar/reportar.module').then( m => m.ReportarPageModule)
  },
  {
    path: 'formulario-reporte',
    loadChildren: () => import('./formulario-reporte/formulario-reporte.module').then( m => m.FormularioReportePageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
