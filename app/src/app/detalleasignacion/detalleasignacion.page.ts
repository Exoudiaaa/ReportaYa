import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-detalleasignacion',
  templateUrl: './detalleasignacion.page.html',
  styleUrls: ['./detalleasignacion.page.scss'],
  standalone: false,
})
export class DetalleasignacionPage implements OnInit {
  reporte: any;
  enTerreno: boolean = false;
  comentariosInspector: string = '';
  constructor(
    private router: Router,
    private firestore: Firestore,
    private toastController: ToastController
  ) {
    const nav = this.router.getCurrentNavigation();
    this.reporte = nav?.extras.state?.['reporte'];
  }

  ngOnInit() {
    if (!this.reporte) {
      console.error('No se recibió el reporte');
      return;
    }

    this.enTerreno = this.reporte.estado?.enTerreno || false;
  }

  async actualizarEnTerreno(event: any) {
    const valor = event.detail.checked;

    try {
      const docRef = doc(this.firestore, `reportes/${this.reporte.id}`);

      await updateDoc(docRef, {
        'estado.enTerreno': valor,
      });
      this.reporte.estado = {
        ...this.reporte.estado,
        enTerreno: valor,
      };

      this.enTerreno = valor;

      this.mostrarToast(
        valor
          ? 'Marcado como "En terreno"'
          : 'Se ha desmarcado el estado "En terreno"'
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      this.mostrarToast('Error al actualizar el estado');
    }
  }

  obtenerEstadoTexto(estado: any): string {
    if (!estado) return 'Desconocido';

    if (estado.resuelto) return 'Resuelto';
    if (estado.enTerreno) return 'En Terreno';
    if (estado.enProceso) return 'En proceso';
    if (estado.pendiente) return 'Pendiente';

    return 'Desconocido';
  }

  obtenerColorEstado(estado: any): string {
    if (!estado) return 'medium';

    if (estado.resuelto) return 'success';
    if (estado.enTerreno) return 'warning';
    if (estado.enProceso) return 'warning';
    if (estado.pendiente) return 'medium';

    return 'medium';
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
   async guardarCambios() {
    try {
      const docRef = doc(this.firestore, `reportes/${this.reporte.id}`);

      await updateDoc(docRef, {
        'estado.enTerreno': this.enTerreno,
        comentariosInspector: this.comentariosInspector.trim(),
        fechaActualizacionInspector: new Date(),
      });

      this.mostrarToast('Cambios guardados correctamente');
      this.router.navigate(['/asignaciones']);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      this.mostrarToast('Error al guardar los cambios');
    }
  }
}
