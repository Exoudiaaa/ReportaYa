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
    // 📸 Abrir cámara
    const foto = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    // 🌍 Intentar actualizar la ubicación después de tomar la foto
    try {
      const coords = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      this.latitud = coords.coords.latitude;
      this.longitud = coords.coords.longitude;

      // ✅ Llamar al LocationService para obtener dirección legible
      await this.locationService.fetchAddress(this.latitud, this.longitud);

      // ✅ Usar la última dirección del BehaviorSubject si existe
      const loc = this.locationService.getCurrentSnapshot();
      if (loc && loc.display) {
        this.ubicacionDisplay = loc.display;
      } else {
        // fallback si no hay dirección
        this.ubicacionDisplay = `Lat: ${this.latitud.toFixed(5)}, Lng: ${this.longitud.toFixed(5)}`;
      }

      console.log(`Ubicación actualizada: ${this.ubicacionDisplay}`);

    } catch (geoError) {
      console.warn('No se pudo actualizar ubicación tras tomar la foto:', geoError);
      this.ubicacionDisplay = 'Ubicación no disponible';
    }

    // 🧩 Reducir la imagen antes de guardarla
    const base64Reducido = await this.reducirImagen(foto.dataUrl!, 800, 600, 0.8);

    // 💾 Guardar la imagen en el campo correspondiente
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

      // Escalado proporcional
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Redibujar imagen en el canvas
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a base64 con calidad ajustada
      const newBase64 = canvas.toDataURL('image/jpeg', calidad);
      resolve(newBase64);
    };
  });
}
  async guardarParte() {
    try {
      this.parte.coordenadas = { lat: this.latitud!, lng: this.longitud! };
      this.parte.ubicacion = this.ubicacionDisplay;

      const user = this.auth.currentUser;
      if (user) {
        this.parte.usuarioEmail = user.email ?? '';
        this.parte.usuarioUID = user.uid;
      }

      const partesCollection = collection(this.firestore, 'partes');
      const docRef = await addDoc(partesCollection, this.parte);

      await setDoc(docRef, { ...this.parte, id: docRef.id });
      console.log('Parte guardado correctamente con ID:', docRef.id);

      await this.mostrarAlerta('Éxito', 'El parte fue enviado correctamente.');

      this.parte = {
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

      this.router.navigate(['/home']);
    } catch (err) {
      console.error('Error guardando parte:', err);
      await this.mostrarAlerta('Error', 'Ocurrió un error al enviar el parte. Inténtalo nuevamente.');
    }
  }
  async eliminarFoto(num: number) {
  const alert = await this.alertController.create({
    header: 'Eliminar foto',
    message: '¿Estás seguro de que deseas eliminar esta foto?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
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

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
