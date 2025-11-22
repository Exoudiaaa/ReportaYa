import { Component, OnInit, OnDestroy } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocationService, Ubicacion } from '../services/location';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Parte } from '../interfaces/parte';
import { Firestore, collection, addDoc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-partes',
  templateUrl: './partes.page.html',
  styleUrls: ['./partes.page.scss'],
  standalone: false,
})
export class PartesPage implements OnInit, OnDestroy {
  ubicacionDisplay: string = 'Ubicación no disponible';
  latitud: number | null = null;
  longitud: number | null = null;
  private locSub?: Subscription;

  parte: Parte = {
    id: '',
    fecha: new Date(),
    coordenadas: { lat: 0, lng: 0 },
    ubicacion: '',
    fotoURL1: '',
    fotoURL2: '',
    fotoURL3: '',
    patente: '',
    comentarios: '',
    infraccion: '',
    usuarioEmail: '',
    usuarioUID: '',
    tipo: '',
    marca: '',
    color: ''
    
  };

  usuarioBloqueado = false;
  
  constructor(
    private locationService: LocationService,
    private firestore: Firestore,
    private auth: Auth,
    private router: Router,
    private alertController: AlertController
  ) {}

  

  async ngOnInit() {
    this.locSub = this.locationService.location$.subscribe((loc: Ubicacion | null) => {
      this.ubicacionDisplay = loc?.display ?? 'Ubicación no disponible';
    });

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

  async abrirCamara(num: number) {
    try {
      const foto = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      try {
        const coords = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        this.latitud = coords.coords.latitude;
        this.longitud = coords.coords.longitude;
        await this.locationService.fetchAddress(this.latitud, this.longitud);
        const loc = this.locationService.getCurrentSnapshot();
        this.ubicacionDisplay = loc?.display ?? `Lat: ${this.latitud.toFixed(5)}, Lng: ${this.longitud.toFixed(5)}`;
      } catch (geoError) {
        console.warn('No se pudo actualizar ubicación:', geoError);
        this.ubicacionDisplay = 'Ubicación no disponible';
      }

      const base64Reducido = await this.reducirImagen(foto.dataUrl!, 800, 600, 0.8);
      if (num === 1) this.parte.fotoURL1 = base64Reducido;
      if (num === 2) this.parte.fotoURL2 = base64Reducido;
      if (num === 3) this.parte.fotoURL3 = base64Reducido;
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  async reducirImagen(base64: string, maxWidth: number, maxHeight: number, calidad: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
    });
  }

  // ✅ VALIDACIÓN: LAS 3 FOTOS SON OBLIGATORIAS
  fotosCompletas(): boolean {
    return (
      (this.parte.fotoURL1?.trim() ?? '') !== '' &&
      (this.parte.fotoURL2?.trim() ?? '') !== '' &&
      (this.parte.fotoURL3?.trim() ?? '') !== ''
    );
  }

  // ✅ VALIDACIÓN: TODOS LOS CAMPOS
  camposCompletos(): boolean {
    return (
      this.fotosCompletas() &&
      (this.parte.patente?.trim() ?? '') !== '' &&
      (this.parte.marca?.trim() ?? '') !== '' &&
      (this.parte.color?.trim() ?? '') !== '' &&
      (this.parte.tipo?.trim() ?? '') !== '' &&
      (this.parte.comentarios?.trim() ?? '') !== '' &&
      (this.parte.infraccion?.trim() ?? '') !== '' &&
      this.latitud !== null &&
      this.longitud !== null
    );
  }

  async guardarParte() {
    // ✅ Validar las 3 fotos
    if (!this.fotosCompletas()) {
      const alert = await this.alertController.create({
        header: 'Faltan fotos',
        message: 'Debes tomar las 3 fotos obligatorias:\n• Parte en papel\n• Vehículo completo\n• Patente legible',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // ✅ Validar campos de texto
    if (
      (this.parte.patente?.trim() ?? '') === '' ||
      (this.parte.marca?.trim() ?? '') === '' ||
      (this.parte.color?.trim() ?? '') === '' ||
      (this.parte.tipo?.trim() ?? '') === '' ||
      (this.parte.comentarios?.trim() ?? '') === '' ||
      (this.parte.infraccion?.trim() ?? '') === ''
    ) {
      const alert = await this.alertController.create({
        header: 'Campos incompletos',
        message: 'Todos los campos son obligatorios. Completa la información del vehículo y la infracción.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // ✅ Validar ubicación
    if (this.latitud === null || this.longitud === null) {
      const alert = await this.alertController.create({
        header: 'Ubicación no disponible',
        message: 'No se pudo obtener tu ubicación. Activa el GPS e intenta nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      this.parte.coordenadas = { lat: this.latitud, lng: this.longitud };
      this.parte.ubicacion = this.ubicacionDisplay;

      const user = this.auth.currentUser;
      if (!user) {
        const alert = await this.alertController.create({
          header: 'Error de autenticación',
          message: 'No se detectó tu sesión. Inicia sesión nuevamente.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

      this.parte.usuarioEmail = user.email ?? '';
      this.parte.usuarioUID = user.uid;

      const partesCollection = collection(this.firestore, 'partes');
      const docRef = await addDoc(partesCollection, this.parte);
      await setDoc(docRef, { ...this.parte, id: docRef.id });

      const alert = await this.alertController.create({
        header: '¡Parte enviado!',
        message: 'El parte se ha registrado correctamente.',
        buttons: [{
          text: 'OK',
          handler: () => this.router.navigate(['/home'])
        }]
      });
      await alert.present();
    } catch (err) {
      console.error('Error guardando parte:', err);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo enviar el parte. Verifica tu conexión e inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async eliminarFoto(num: number) {
    const alert = await this.alertController.create({
      header: 'Eliminar foto',
      message: '¿Estás seguro de que deseas eliminar esta foto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            if (num === 1) this.parte.fotoURL1 = '';
            if (num === 2) this.parte.fotoURL2 = '';
            if (num === 3) this.parte.fotoURL3 = '';
          }
        }
      ]
    });
    await alert.present();
  }
}