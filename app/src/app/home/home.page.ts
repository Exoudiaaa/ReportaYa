import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import { LocationService, Ubicacion } from '../services/location';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Reporte } from '../services/reporte';
import { ModalController, ViewDidEnter } from '@ionic/angular';
import { ReporteModalComponent } from '../reporte-modal/reporte-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements AfterViewInit,OnInit, OnDestroy, ViewDidEnter {
  rango: string ="";
  private map!: L.Map;
  private reportMarkers: L.Marker[] = [];
  usuarioDisplay: string = '';
  ubicacionDisplay: string = 'Ubicación no disponible';
  private locSub?: Subscription;
  private reportRefreshInterval?: any;
  constructor(
    private locationService: LocationService,
    private authService: Auth,
    private router: Router,
    private reportesService: Reporte,
    private modalCtrl: ModalController 
  ) { }
  async ngOnInit(): Promise<void> {
    const userData = await this.authService.getCurrentUserData();
      console.log(userData.nombre);
      this.rango = userData?.rango || 'ciudadano';
      console.log(this.rango)
  }
  ngAfterViewInit() {
    this.subscribeToLocation();
    this.getUserLocation();
    this.startRefreshingReportes(10000); // cada 10 segundos
  }

  ngOnDestroy() {
    this.locSub?.unsubscribe();
    this.stopRefreshingReportes();
  }

  ionViewDidEnter() {
    // Aseguramos que el mapa se redibuje correctamente al volver a la página
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  private subscribeToLocation() {
    this.locSub = this.locationService.location$.subscribe((loc: Ubicacion | null) => {
      this.ubicacionDisplay = loc?.display ?? 'Ubicación no disponible';
      // Actualizar popup si el mapa ya está inicializado
      if (this.map && loc) {
        const marker = L.marker([loc.lat!, loc.lng!]).bindPopup(this.ubicacionDisplay).openPopup();
        marker.addTo(this.map);
      }
    });
  }

  private async getUserLocation() {
    try {
      const coords = await Geolocation.getCurrentPosition();
      const lat = coords.coords.latitude;
      const lng = coords.coords.longitude;

      this.locationService.setLocation({ lat, lng });
      await this.locationService.fetchAddress(lat, lng);

      this.initMap(lat, lng);

    } catch (err) {
      console.error('Error obteniendo GPS:', err);
      this.ubicacionDisplay = 'Ubicación no disponible';
    }
  }

  private initMap(lat: number, lng: number) {
    // Solo inicializamos el mapa si no existe
    if (!this.map) {
      this.map = L.map('mapId').setView([lat, lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      // 👇 Aquí usamos una imagen local como icono
      const userIcon = L.icon({
        iconUrl: 'assets/icono-usuario.png', // ruta de la imagen local
        iconSize: [50, 50], // tamaño del icono
        iconAnchor: [25, 45], // punto del icono que se ubicará en la coordenada
        popupAnchor: [0, -45] // posición del popup respecto al icono
      });

          // Agregar marcador con el nuevo icono
        L.marker([lat, lng], { icon: userIcon })
          .addTo(this.map)
          .bindPopup(this.ubicacionDisplay)
          .openPopup();
      } else {
        // Si ya existe, solo movemos el centro
        this.map.setView([lat, lng], 16);
      }

    this.cargarReportes();
  }

  private cargarReportes() {
    this.reportesService.obtenerReportes().subscribe(reportes => {
      // Eliminamos marcadores anteriores
      this.reportMarkers.forEach(m => this.map.removeLayer(m));
      this.reportMarkers = [];

      reportes
        .filter(r => r.visibilidad === true && r.coordenadas)
        .forEach(reporte => {
          let lat: number;
          let lng: number;

          if ('lat' in reporte.coordenadas && 'lng' in reporte.coordenadas) {
            lat = reporte.coordenadas.lat;
            lng = reporte.coordenadas.lng;
          } else if (Array.isArray(reporte.coordenadas) && reporte.coordenadas.length === 2) {
            [lat, lng] = reporte.coordenadas;
          } else {
            console.warn('Coordenadas inválidas para el reporte:', reporte);
            return;
          }

          const reporteIcon = L.divIcon({
            html: `<span class="material-symbols-outlined" style="font-size: 40px; color: #FF5722;">report_problem</span>`,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 35],
            popupAnchor: [0, -35]
          });
          const marker = L.marker([lat, lng], { icon: reporteIcon }).addTo(this.map);
          marker.bindPopup(`<b>${reporte.titulo || 'Reporte sin título'}</b>`);
          this.reportMarkers.push(marker);
          marker.on('click', async () => {
            const modal = await this.modalCtrl.create({
              component: ReporteModalComponent,
              componentProps: { reporte },
              cssClass: 'custom-modal',
              backdropDismiss: true
            });
            await modal.present();
          });
        });
    });
  }
  private startRefreshingReportes(intervalMs: number) {
  this.reportRefreshInterval = setInterval(() => {
    this.cargarReportes();
  }, intervalMs);
}

private stopRefreshingReportes() {
  if (this.reportRefreshInterval) {
    clearInterval(this.reportRefreshInterval);
    this.reportRefreshInterval = undefined;
  }
}


}
