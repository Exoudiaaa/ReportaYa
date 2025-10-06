import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationService, Ubicacion } from '../services/location';
import { Subscription } from 'rxjs';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

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

  descripcion: string = '';
  foto: string | null = null;        // preview para <ion-img>
  fotoBase64: string | null = null;  // base64 pura

  ubicacionDisplay: string = 'Ubicación no disponible';
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
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        quality: 70,
        width: 1024,
        source: CameraSource.Camera
      });

      if (photo && photo.base64String) {
        this.fotoBase64 = photo.base64String;
        this.foto = 'data:image/jpeg;base64,' + photo.base64String; // preview
      }
    } catch (err) {
      console.error('Error cámara', err);
    }
  }

  // Eliminar foto
  confirmarEliminarFoto() {
    this.foto = null;
    this.fotoBase64 = null;
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
  return; // salir si no hay usuario
}
  // Validar campos obligatorios
  if (!this.descripcion || !this.foto) {
    const alert = await this.alertCtrl.create({
      header: 'Campos incompletos',
      message: 'Debes agregar una foto y escribir la descripción.',
      buttons: ['OK']
    });
    await alert.present();
    return; // salir de la función
  }

  const loading = await this.loadingCtrl.create({ message: 'Enviando reporte...' });
  await loading.present();

  try {
    const reporte = {
      descripcion: this.descripcion,
      fotoURL: this.foto,
      ubicacion: this.ubicacionDisplay || null,
      icono: this.iconoSeleccionado || null,
      nombre: this.nombreSeleccionado || null,
      color: this.colorSeleccionado || null,
      estado: 'pendiente',
      creadoEn: new Date(),
      usuarioUID: usuarioActual.uid,      // 🔹 UID del usuario
      usuarioEmail: usuarioActual.email  // 🔹 opcional
      
    };

    const colRef = collection(this.firestore as any, 'reportes');
    await addDoc(colRef, reporte);

    await loading.dismiss();



    // Aquí viene el popup en vez del toast
    const alert = await this.alertCtrl.create({
      header: 'Reporte enviado',
      message: 'Se reportó un incidente exitosamente.',
      buttons: [{
        text: 'OK',
        handler: () => {
          // Limpiar formulario
          this.descripcion = '';
          this.confirmarEliminarFoto();
          // Navegar a home
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

  ngOnInit() {
    // parámetros que llegan desde la navegación
    this.nombreSeleccionado = this.route.snapshot.paramMap.get('nombre') || '';
    this.iconoSeleccionado = this.route.snapshot.paramMap.get('icono') || '';
    this.colorSeleccionado = this.route.snapshot.paramMap.get('color') || '';

    // suscripción a ubicación
    this.locSub = this.locationService.location$.subscribe((loc: Ubicacion | null) => {
      this.ubicacionDisplay = loc?.display ?? 'Ubicación no disponible';
    });
  }

  ngOnDestroy() {
    this.locSub?.unsubscribe();
  }
}
