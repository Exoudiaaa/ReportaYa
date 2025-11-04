import { Component, OnInit } from '@angular/core';
import { Auth } from '../services/auth';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.page.html',
  styleUrls: ['./asignaciones.page.scss'],
  standalone: false,
})
export class AsignacionesPage implements OnInit {

  reportes: any[] = [];

  constructor(
    private reporteService: Auth,
    private loadingCtrl: LoadingController,
    private router : Router
  ) { }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando reportes...' });
    await loading.present();

    this.reportes = await this.reporteService.obtenerReportesAsignados();
    await loading.dismiss();

    console.log('Reportes del inspector:', this.reportes);
  }
  obtenerEstadoTexto(estado: any): string {
    if (!estado) return 'Desconocido';

    if (estado.resuelto) return 'Resuelto';
    if (estado.enTerreno) return 'En Terreno'
    if (estado.enProceso) return 'En proceso';
    if (estado.pendiente) return 'Pendiente';

    return 'Desconocido';
  }

  obtenerColorEstado(estado: any): string {
    if (!estado) return 'medium';

    if (estado.resuelto) return 'success';   // verde
    if (estado.enProceso) return 'warning';  // amarillo
    if (estado.enTerreno) return 'warning'
    if (estado.pendiente) return 'medium';   // gris

    return 'medium';
  }
  verDetalle(reporte: any) {
  this.router.navigate(['/detalleasignacion'], {
    state: { reporte }
  });
}
}
