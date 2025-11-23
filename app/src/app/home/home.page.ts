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

  ubicacionHabilitada = false; // 🔹 Nuevo: control de estado de ubicación

  presentingElement: any;

  isModalOpen = false;


private userMarker: L.Marker | null = null;

  
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


private async escucharCambiosPermisos() {
  // Solo funciona en dispositivos móviles con Capacitor
  if (Capacitor.getPlatform() !== 'web') {
    try {
      // Este listener se activa cuando el usuario cambia los permisos en ajustes
      await Geolocation.requestPermissions();
      // Si llegamos aquí, el permiso fue concedido
      await this.verificarUbicacion();
    } catch (error) {
      // Permiso aún denegado
      console.log('Permiso de ubicación aún denegado');
    }
  }
}




  async ngOnInit() {

    this.presentingElement = document.querySelector('ion-tabs');
    const userData = await this.authService.getCurrentUserData();
    this.usuarioNombre = userData?.firstName || '';
    this.usuarioApellido = userData?.lastName || '';
    this.rango = userData?.rango || '';
    console.log(this.rango)
  }




 

  ionViewDidEnter() {
    if (this.map && this.ubicacionHabilitada) {
      this.map.invalidateSize();
    }
  }

    private subscribeToLocation() {
  // ✅ Cancela la suscripción anterior para evitar duplicados
  if (this.locSub) {
    this.locSub.unsubscribe();
  }

  this.locSub = this.locationService.location$.subscribe((loc: Ubicacion | null) => {
    this.ubicacionDisplay = loc?.display ?? 'Ubicación no disponible';

    if (this.map && loc && this.ubicacionHabilitada) {
      // ✅ Elimina el marcador anterior SI EXISTE
      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
        this.userMarker = null; // 👈 Importante: resetea la referencia
      }

      const userIcon = L.icon({
        iconUrl: '/assets/icono-usuario2.png',
       iconSize: [60, 60],
        iconAnchor: [30, 60],
        popupAnchor: [0, -60]    // el popup aparece justo encima
      });

      this.userMarker = L.marker([loc.lat!, loc.lng!], { icon: userIcon })
        .bindPopup(this.ubicacionDisplay)
        .openPopup();

      this.userMarker.addTo(this.map);
    }
  });
}


ngOnDestroy() {
  if (this.userMarker && this.map) {
    this.map.removeLayer(this.userMarker);
    this.userMarker = null; // 👈 Reset
  }
  if (this.locSub) {
    this.locSub.unsubscribe();
    this.locSub = undefined;
  }
  this.stopRefreshingReportes();
}

  // 🔹 Nueva función: verifica si la ubicación está disponible
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
      this.locationService.setLocation({ lat, lng });
      await this.locationService.fetchAddress(lat, lng);
      this.initMap(lat, lng);
    } catch (err) {
      console.error('Ubicación no disponible:', err);
      this.ubicacionHabilitada = false;
      this.ubicacionDisplay = 'Ubicación no disponible';
    }
  }

  // 🔹 Nueva función: para el botón "Intentar nuevamente"
  async solicitarUbicacion() {
    await this.verificarUbicacion();
  }

  private async initMap(lat: number, lng: number) {
      if (!this.map) {
        // ✅ Aumentamos el zoom a 18 para ver más detalles
        this.map = L.map('mapId').setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(this.map);

        const userIcon = L.icon({
          iconUrl: 'assets/icono-usuario2.png',
          iconSize: [60, 60],
        iconAnchor: [30, 65],
        popupAnchor: [0, -60]  
        });

        L.marker([lat, lng], { icon: userIcon })
          .addTo(this.map)
          .bindPopup(this.ubicacionDisplay)
          .openPopup();

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

        // ✅ Ajustamos el fitBounds para que no sobrescriba el zoom
        // Solo usamos fitBounds si no queremos forzar el zoom
        // this.map.fitBounds(comunaLayer.getBounds());

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

      } else {
        // ✅ También ajustamos el zoom al volver a cargar
        this.map.setView([lat, lng], 18);
      }

      this.cargarReportes();
    }





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




  ngAfterViewInit() {
  // ✅ Solo suscríbete una vez
  if (!this.locSub) {
    this.subscribeToLocation();
  }
  this.verificarUbicacion();
  this.startRefreshingReportes(10000);
}

  
}