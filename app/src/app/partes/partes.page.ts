import { Component, OnInit, OnDestroy } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocationService, Ubicacion } from '../services/location';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Parte } from '../interfaces/parte';
import { Firestore, collection, addDoc,setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
@Component({
  selector: 'app-partes',
  templateUrl: './partes.page.html',
  styleUrls: ['./partes.page.scss'],
  standalone:false,
})
export class PartesPage implements OnInit,OnDestroy {
  ubicacionDisplay: string = 'Ubicación no disponible';  // dirección legible
  latitud: number | null = null;      // latitud GPS
  longitud: number | null = null;       // longitud GPS
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
  ) {}
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
    async abrirCamara(num: number) {
    try {
      const foto = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const base64 = foto.dataUrl!;

      if (num === 1) this.parte.fotoURL1 = base64;
      if (num === 2) this.parte.fotoURL2 = base64;
      if (num === 3) this.parte.fotoURL3 = base64;

      console.log(`📸 Imagen ${num} tomada correctamente`);

    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }
   async guardarParte() {
  try {
    // 1️⃣ Agregamos coordenadas y dirección actual
    this.parte.coordenadas = { lat: this.latitud!, lng: this.longitud! };
    this.parte.ubicacion = this.ubicacionDisplay;

    // 2️⃣ Datos del usuario actual
    const user = this.auth.currentUser;
    if (user) {
      this.parte.usuarioEmail = user.email ?? '';
      this.parte.usuarioUID = user.uid;
    }

    // 3️⃣ Guardamos en Firestore
    const partesCollection = collection(this.firestore, 'partes');
    const docRef = await addDoc(partesCollection, this.parte);

    // 4️⃣ Obtenemos el ID generado por Firestore y lo guardamos dentro del mismo documento
    await setDoc(docRef, { ...this.parte, id: docRef.id });

    console.log('✅ Parte guardado correctamente con ID:', docRef.id);

    // 5️⃣ Limpiar formulario (opcional)
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

  } catch (err) {
    console.error('Error guardando parte:', err);
  }
}

}