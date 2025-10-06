import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import { LocationService, Ubicacion } from '../services/location';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements AfterViewInit {
  private map!: L.Map;
  usuarioDisplay: string = '';   // Para mostrar nombre/email del usuario
  ubicacionDisplay: string = 'Ubicación no disponible';
  private LOCATIONIQ_KEY = 'pk.5b6df700376c8e94f79168a449497666'; // tu API Key de LocationIQ

  constructor(
    private locationService: LocationService,
    private authService: Auth, 
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.getUserLocation();
  }

  private async getUserLocation() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Guardamos lat/lng temporal en el servicio
        this.locationService.setLocation({ lat, lng });

        // Intentamos obtener dirección legible
        await this.getAddressFromCoords(lat, lng);

        // Inicializar mapa
        this.initMap(lat, lng);

      },
      (error) => {
        console.error('No se pudo obtener la ubicación:', error);
        alert('No se pudo obtener tu ubicación. Asegúrate de permitir el acceso al GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  private async getAddressFromCoords(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${this.LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const direccion = data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

      // Guardamos en LocationService
      this.locationService.setLocation({ lat, lng, display: direccion });
      this.ubicacionDisplay = direccion;
      console.log('Dirección obtenida:', direccion);

    } catch (error) {
      console.error('Error geocoding inverso:', error);
      this.ubicacionDisplay = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
      this.locationService.setLocation({ lat, lng, display: this.ubicacionDisplay });
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