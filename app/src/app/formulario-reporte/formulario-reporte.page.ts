import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationService, Ubicacion } from '../services/location';
import { Subscription } from 'rxjs';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-formulario-reporte',
  templateUrl: './formulario-reporte.page.html',
  styleUrls: ['./formulario-reporte.page.scss'],
  standalone: false,
})
export class FormularioReportePage implements OnInit, OnDestroy {

  visibilidad: boolean = false;     // visibilidad del reporte (público/privado)
  descripcion: string = '';           // descripción del reporte
  foto: string | null = null;        // preview para <ion-img>
  fotoBase64: string | null = null;  // base64 pura

  pendiente: boolean = true;     // por defecto los reportes son pendientes
  enProceso: boolean = false;     // por defecto los reportes no están en proceso
  resuelto: boolean = false;      // por defecto los reportes no están resueltos

  ubicacionDisplay: string = 'Ubicación no disponible';  // dirección legible
  latitud: number | null = null;      // latitud GPS
  longitud: number | null = null;       // longitud GPS
  private locSub?: Subscription;

  constructor(
    private route: ActivatedRoute, 
    private locationService: LocationService,
    private alertCtrl: AlertController,
    private firestore: Firestore,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,  
    private auth: Auth  
  ) {}

  // Abrir cámara y guardar base64
  async abrirCamara() {
    if (this.foto) {
      console.log('Ya existe una foto cargada');
      return;
    }

    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        quality: 70,
        width: 1024,
        source: CameraSource.Camera
      });

      if (photo && photo.base64String) {
        this.fotoBase64 = photo.base64String;
        this.foto = 'data:image/jpeg;base64,' + photo.base64String;
      }
    } catch (err) {
      console.error('Error cámara', err);
    }
  }

  // Confirmar eliminación de foto
  async confirmarEliminarFoto() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar foto',
      message: '¿Estás seguro de que deseas eliminar la foto?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.foto = null;
            this.fotoBase64 = null;
          },
        },
      ],
    });

    await alert.present();
  }

  // Guardar reporte en Firestore
  async submitReport() {
    const usuarioActual = this.auth.currentUser;

    if (!usuarioActual) {
      const alert = await this.alertCtrl.create({
        header: 'Usuario no logueado',
        message: 'Debes iniciar sesión para enviar un reporte.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (!this.descripcion || !this.foto) {
      const alert = await this.alertCtrl.create({
        header: 'Campos incompletos',
        message: 'Debes agregar una foto y escribir la descripción.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Enviando reporte...' });
    await loading.present();

    try {
      const reporte = {
        descripcion: this.descripcion,
        fotoURL: this.foto,
        ubicacion: this.ubicacionDisplay || null,
        visibilidad: this.visibilidad,
        coordenadas: {
          lat: this.latitud,
          lng: this.longitud
        },
        estado: {
          pendiente: this.pendiente,
          enProceso: this.enProceso,
          resuelto: this.resuelto
        },
        fecha: new Date(),
        usuarioUID: usuarioActual.uid,
        usuarioEmail: usuarioActual.email
      };

      const colRef = collection(this.firestore as any, 'reportes');
      await addDoc(colRef, reporte);

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Reporte enviado',
        message: 'Se reportó un incidente exitosamente.',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.descripcion = '';
            this.foto = null;
            this.fotoBase64 = null;
            this.router.navigate(['/home']);
          }
        }]
      });
      await alert.present();

    } catch (err) {
      console.error('Error al enviar reporte', err);
      await loading.dismiss();
      const toast = await this.toastCtrl.create({ message: 'Error enviando reporte', duration: 3000 });
      await toast.present();
    }
  }

  // 🔹 ngOnInit actualizado para obtener ubicación resumida automáticamente
  async ngOnInit() {
    // Suscripción al BehaviorSubject
    this.locSub = this.locationService.location$.subscribe((loc: Ubicacion | null) => {
      this.ubicacionDisplay = loc?.display ?? 'Ubicación no disponible';
    });

    // Obtener coordenadas GPS y luego la dirección resumida
    try {
      const coords = await Geolocation.getCurrentPosition();
      this.latitud = coords.coords.latitude;
      this.longitud = coords.coords.longitude;

      await this.locationService.fetchAddress(this.latitud, this.longitud);
    } catch (err) {
      console.error('Error obteniendo GPS:', err);
      this.ubicacionDisplay = 'Ubicación no disponible';
    }
  }

  ngOnDestroy() {
    this.locSub?.unsubscribe();
  }
}