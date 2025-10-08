import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import { LocationService, Ubicacion } from '../services/location';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  usuarioDisplay: string = '';   
  ubicacionDisplay: string = 'Ubicación no disponible';
  private locSub?: Subscription;

  constructor(
    private locationService: LocationService,
    private authService: Auth, 
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.subscribeToLocation();
    this.getUserLocation();
  }

  ngOnDestroy() {
    this.locSub?.unsubscribe();
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

      // Guardar coordenadas en LocationService
      this.locationService.setLocation({ lat, lng });

      // Obtener dirección resumida desde LocationIQ
      await this.locationService.fetchAddress(lat, lng);

      // Inicializar mapa
      this.initMap(lat, lng);

    } catch (err) {
      console.error('Error obteniendo GPS:', err);
      this.ubicacionDisplay = 'Ubicación no disponible';
    }
  }

  private initMap(lat: number, lng: number) {
    this.map = L.map('mapId').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Marcador con icono Ionicon
    const userIcon = L.divIcon({
      html: `<ion-icon name="person-circle" style="font-size: 50px; color: #ff0015ff;"></ion-icon>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 35],
      popupAnchor: [0, -35]
    });

    L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup(this.ubicacionDisplay)
      .openPopup();

    setTimeout(() => this.map.invalidateSize(), 500);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}