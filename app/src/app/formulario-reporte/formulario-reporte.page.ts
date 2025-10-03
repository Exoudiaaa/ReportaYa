import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationService, Ubicacion } from '../services/location';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-formulario-reporte',
  templateUrl: './formulario-reporte.page.html',
  styleUrls: ['./formulario-reporte.page.scss'],
  standalone: false,
})
export class FormularioReportePage implements OnInit, OnDestroy {
  nombreSeleccionado: string = '';
  iconoSeleccionado: string = '';
  colorSeleccionado: string = '';
  foto: string = '' // Aquí guardaremos la foto

  ubicacionDisplay: string = 'Ubicación no disponible';
  private locSub?: Subscription;

  constructor(private route: ActivatedRoute, private locationService: LocationService,private alertCtrl: AlertController) {}

  async abrirCamara() {
      // Si ya hay una foto, mostramos popup
    if (this.foto) {
      this.mostrarAlerta();
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // o Uri si quieres la ruta
        source: CameraSource.Camera, // para abrir la cámara
      });

      this.foto = image.dataUrl!; // Guardamos la foto
    } catch (error) {
      console.log('Error al abrir la cámara', error);
    }
  }

  // Alerta para indicar que solo se puede una foto
  async mostrarAlerta() {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message: 'Solo se puede agregar una foto.',
      buttons: ['OK']
    });
    await alert.present();
  }

  // Confirmar eliminación de foto
  async confirmarEliminarFoto() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro que quieres eliminar la foto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.foto = '';
          }
        }
      ]
    });

    await alert.present();
  }


  
  ngOnInit() {
    // parámetros que llegan desde la navegación
    this.nombreSeleccionado = this.route.snapshot.paramMap.get('nombre') || '';
    this.iconoSeleccionado = this.route.snapshot.paramMap.get('icono') || '';
    this.colorSeleccionado = this.route.snapshot.paramMap.get('color') || '';

    // suscripción a la ubicación
    this.locSub = this.locationService.location$.subscribe((loc: Ubicacion | null) => {
      this.ubicacionDisplay = loc?.display ?? 'Ubicación no disponible';
    });
  }

  ngOnDestroy() {
    this.locSub?.unsubscribe();
  }
}