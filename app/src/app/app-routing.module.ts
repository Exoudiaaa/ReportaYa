import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authguard/authguard';

const routes: Routes = [
  // 👇 Rutas protegidas: requieren estar logeado
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'formulario-reporte',
    loadChildren: () => import('./formulario-reporte/formulario-reporte.module').then(m => m.FormularioReportePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'camaras',
    loadChildren: () => import('./camaras/camaras.module').then(m => m.CamarasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/menu.module').then(m => m.MenuPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'historial',
    loadChildren: () => import('./historial/historial.module').then(m => m.HistorialPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'historial-camaras',
    loadChildren: () => import('./historial-camaras/historial-camaras.module').then(m => m.HistorialCamarasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'partes',
    loadChildren: () => import('./partes/partes.module').then(m => m.PartesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'asignaciones',
    loadChildren: () => import('./asignaciones/asignaciones.module').then(m => m.AsignacionesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'detalleasignacion',
    loadChildren: () => import('./detalleasignacion/detalleasignacion.module').then(m => m.DetalleasignacionPageModule),
    canActivate: [AuthGuard]
  },

  // 👇 Rutas públicas: acceso sin login
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'phone-login',
    loadChildren: () => import('./phone-login/phone-login.module').then(m => m.PhoneLoginPageModule)
  },

  // 👇 Redirección por defecto
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // 👇 Si intenta ir a una ruta inexistente
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
