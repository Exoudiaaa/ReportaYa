import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import { LocationService, Ubicacion } from '../services/location';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Reporte } from '../services/reporte';
import { ModalController, ViewDidEnter, Platform, AlertController } from '@ionic/angular';
import { ReporteModalComponent } from '../reporte-modal/reporte-modal.component';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit, OnInit, OnDestroy, ViewDidEnter {

  rango: string = "";
  usuarioNombre: string = '';
  usuarioApellido: string = '';
  hasOverlayNavigation = false;
  private map!: L.Map;
  private reportMarkers: L.Marker[] = [];

  usuarioDisplay: string = '';
  ubicacionDisplay: string = 'Ubicación no disponible';

  private locSub?: Subscription;
  private reportRefreshInterval?: any;

  ubicacionHabilitada = false; // control de estado de ubicación
  presentingElement: any;
  isModalOpen = false;

  private userMarker: L.Marker | null = null;

  // id del watch (puede ser string en Capacitor o number en navigator)
  private watchId: any = undefined;

  constructor(
    private locationService: LocationService,
    private authService: Auth,
    private router: Router,
    private reportesService: Reporte,
    private modalCtrl: ModalController,
    private platform: Platform,
    private alertController: AlertController,
  ) {
    this.platform.ready().then(() => {
      setInterval(() => {
        const tabBar = document.querySelector('ion-tab-bar');
        this.hasOverlayNavigation = tabBar?.classList.contains('has-overlay-navigation') || false;
      }, 1000);
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('ion-tabs');
    const userData = await this.authService.getCurrentUserData();
    this.usuarioNombre = userData?.firstName || '';
    this.usuarioApellido = userData?.lastName || '';
    this.rango = userData?.rango || '';

    // Nos suscribimos inmediatamente para mostrar marcador si ya hay ubicación
    this.subscribeToLocation();
  }

  ionViewDidEnter() {
    if (this.map && this.ubicacionHabilitada) {
      this.map.invalidateSize();
    }
  }

  // ----------------------------------------------------
  // Suscripción al LocationService (actualiza marcador)
  // ----------------------------------------------------
  private subscribeToLocation() {
    if (this.locSub) this.locSub.unsubscribe();

    this.locSub = this.locationService.location$.subscribe((loc: Ubicacion | null) => {
      this.ubicacionDisplay = loc?.display ?? 'Ubicación no disponible';

      if (!this.map || !loc || !this.ubicacionHabilitada) return;

      const { lat, lng } = loc;

      const userIcon = L.icon({
        iconUrl: '/assets/icono-usuario2.png',
        iconSize: [60, 60],
        iconAnchor: [30, 60],
        popupAnchor: [0, -60]
      });

      // Si ya existe marcador, solo mover y actualizar popup
      if (this.userMarker) {
        this.userMarker.setLatLng([lat!, lng!]);
        this.userMarker.bindPopup(this.ubicacionDisplay);
        return;
      }

      // Primera vez: crear el marcador
      this.userMarker = L.marker([lat!, lng!], { icon: userIcon })
        .addTo(this.map)
        .bindPopup(this.ubicacionDisplay);
    });
  }

  ngOnDestroy() {
    // limpiar marcador
    if (this.userMarker && this.map) {
      try { this.map.removeLayer(this.userMarker); } catch (e) { }
      this.userMarker = null;
    }

    if (this.locSub) {
      this.locSub.unsubscribe();
      this.locSub = undefined;
    }

    // detener watch y refresco de reportes
    this.stopWatchingPosition();
    this.stopRefreshingReportes();
  }

  // ----------------------------------------------------
  // permisos y verificación de ubicación + iniciar watch
  // ----------------------------------------------------
  private async verificarUbicacion() {
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const coords = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      this.ubicacionHabilitada = true;
      const lat = coords.coords.latitude;
      const lng = coords.coords.longitude;

      // actualizamos el servicio y pedimos reverse geocoding
      this.locationService.setLocation({ lat, lng });
      await this.locationService.fetchAddress(lat, lng);

      // inicializamos/centramos mapa
      await this.initMap(lat, lng);

      // iniciamos el watch para actualizar la posición en tiempo real
      this.startWatchingPosition();

    } catch (err) {
      console.error('Ubicación no disponible:', err);
      this.ubicacionHabilitada = false;
      this.ubicacionDisplay = 'Ubicación no disponible';
    }
  }

  // botón "Intentar nuevamente"
  async solicitarUbicacion() {
    await this.verificarUbicacion();
  }

  // ----------------------------------------------------
  // Watch position (Capacitor + fallback web)
  // ----------------------------------------------------
  private startWatchingPosition() {
    // si ya hay uno, no crear otro
    if (this.watchId) return;

    const options: any = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    // Móvil: Capacitor
    if (Capacitor.getPlatform() !== 'web') {
      try {
        // Geolocation.watchPosition devuelve un id (string) en Capacitor
        this.watchId = Geolocation.watchPosition(options, (pos: any, err: any) => {
          if (err) {
            console.warn('watchPosition error (capacitor):', err);
            return;
          }
          if (!pos || !pos.coords) return;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.locationService.setLocation({ lat, lng });
          this.locationService.fetchAddress(lat, lng).catch(() => { });
        });
      } catch (e) {
        console.warn('No fue posible usar Geolocation.watchPosition (capacitor). Fallback a navigator.', e);
      }
    }

    // Web fallback o si no se obtuvo watchId
    if (!this.watchId && 'geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.locationService.setLocation({ lat, lng });
          this.locationService.fetchAddress(lat, lng);
        },
        (error) => {
          console.warn('watchPosition error (navigator):', error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      this.watchId = id; // number
    }
  }

  private async stopWatchingPosition() {
    if (!this.watchId) return;

    // Intentar clear para Capacitor
    try {
      // algunos bindings requieren objeto { id: string }
      if (Capacitor.getPlatform() !== 'web') {
        // Algunos Capacitor usan Geolocation.clearWatch({ id }); otras versiones usan clearWatch(id) -> manejamos ambos
        try {
          // @ts-ignore - método puede variar entre versiones
          await Geolocation.clearWatch({ id: this.watchId });
        } catch (e) {
          try {
            // @ts-ignore fallback
            await Geolocation.clearWatch(this.watchId);
          } catch (err) {
            console.warn('No se pudo clearWatch vía Geolocation API:', err);
          }
        }
      } else {
        // web
        if (typeof this.watchId === 'number') navigator.geolocation.clearWatch(this.watchId);
      }
    } catch (e) {
      console.warn('Error al limpiar watchId:', e);
    } finally {
      this.watchId = undefined;
    }
  }

  // ----------------------------------------------------
  // Inicializar mapa (no crea marcador de usuario — lo hace la suscripción)
  // ----------------------------------------------------
  private async initMap(lat: number, lng: number) {
    if (!this.map) {
      this.map = L.map('mapId').setView([lat, lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      // agregamos capa comuna y máscara como antes
      try {
        const response = await fetch('assets/PRC_San_Bernardo.geojson');
        const comunaGeoJson = await response.json();

        const comunaLayer = L.geoJSON(comunaGeoJson, {
          style: {
            color: '#40ff00ff',
            weight: 0,
            fillColor: '#ffffff',
            fillOpacity: 0.0
          }
        }).addTo(this.map);

        const worldBounds: L.LatLngExpression[] = [
          [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]
        ];

        const comunaPolygons: L.LatLngTuple[][] = [];
        comunaLayer.getLayers().forEach((layer: any) => {
          const latlngs = layer.getLatLngs();
          latlngs.forEach((multi: any) => {
            multi.forEach((poly: L.LatLng[]) => {
              const hole: L.LatLngTuple[] = poly.map(p => [p.lat, p.lng]);
              comunaPolygons.push(hole);
            });
          });
        });

        L.polygon([worldBounds, ...comunaPolygons], {
          color: 'gray',
          fillColor: 'gray',
          fillOpacity: 0.5,
          stroke: false
        }).addTo(this.map);
      } catch (e) {
        console.warn('No se pudo cargar geojson de comuna:', e);
      }

    } else {
      // solo centra/ajusta vista
      this.map.setView([lat, lng], 18);
    }

    // cargar reportes después de tener mapa listo
    this.cargarReportes();
  }

  // ----------------------------------------------------
  // Cargar reportes (igual que tu lógica)
  // ----------------------------------------------------
  private cargarReportes() {
    if (!this.ubicacionHabilitada) return;

    this.reportesService.obtenerReportes().subscribe(reportes => {
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
            html: `<span class="material-symbols-outlined" style="font-size: 40px; color: #ff0000ff;">report_problem</span>`,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 35],
            popupAnchor: [0, -35]
          });

          const marker = L.marker([lat, lng], { icon: reporteIcon }).addTo(this.map);
          marker.bindPopup(`<b>${reporte.categoria || 'Sin Categoria'}</b>`);
          this.reportMarkers.push(marker);

          marker.on('click', async () => {
            const modal = await this.modalCtrl.create({
              component: ReporteModalComponent,
              componentProps: { reporte },
              cssClass: 'modal-no-fullscreen',
              backdropDismiss: true
            });
            await modal.present();
          });
        });
    });
  }

  private startRefreshingReportes(intervalMs: number) {
    this.reportRefreshInterval = setInterval(() => {
      if (this.ubicacionHabilitada) {
        this.cargarReportes();
      }
    }, intervalMs);
  }

  private stopRefreshingReportes() {
    if (this.reportRefreshInterval) {
      clearInterval(this.reportRefreshInterval);
      this.reportRefreshInterval = undefined;
    }
  }

  // ----------------------------------------------------
  // Ciclo de vida
  // ----------------------------------------------------
  ngAfterViewInit() {
    // Ya nos suscribimos en ngOnInit; aquí solicitamos permisos / ubicación inicial
    this.verificarUbicacion();
    this.startRefreshingReportes(10000);
  }
}
