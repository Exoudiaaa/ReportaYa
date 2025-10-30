
import { Component, OnInit } from '@angular/core';
import { Reporte } from '../services/reporte'; // tu servicio existente
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {
  reportes: any[] = [];
  cargando: boolean = true;

  constructor(private reportesService: Reporte, private auth: Auth) { }

  ngOnInit() {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    const usuario = this.auth.currentUser;
    if (!usuario) return;

    this.reportesService.obtenerReportes().subscribe((todos) => {
      this.reportes = todos
        .filter((r) => r.usuarioUID === usuario.uid)
        .sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0)); // Ordenar por fecha descendente

      this.cargando = false; // 👈 ocultamos el spinner cuando termina
    });
  }

    convertirFecha(timestamp: any): string {
  if (!timestamp) return 'Fecha no disponible';

  // Si Firestore guarda como Timestamp
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Si guarda como Date (por new Date() del front)
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Si todo falla
  return 'Fecha no disponible';
}

obtenerEstadoTexto(estado: any): string {
  if (!estado) return 'Estado desconocido';

  if (estado.pendiente) return 'Su reporte está pendiente.';
  if (estado.enProceso) return 'Su reporte está en proceso.';
  if (estado.resuelto) return 'Su reporte fue resuelto.';

  return 'Estado no definido';
}

}
