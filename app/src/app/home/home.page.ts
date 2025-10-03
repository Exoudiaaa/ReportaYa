import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.locatecontrol'; // Plugin para el botón de ubicación
import { LocationService } from '../services/location'; // ajusta la ruta si hace falta
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements AfterViewInit {
  ionViewWillLeave() {
    // Quita el foco de cualquier elemento antes de salir de la página
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
  private map!: L.Map;

  constructor(private locationService: LocationService,private authService: Auth, private router: Router) {}



  ngAfterViewInit() {
    this.getUserLocation();
  }
  private getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Guardamos lat/lng en el servicio
          this.locationService.setLocation({ lat, lng });
          this.initMap(lat, lng);
        },
        (error) => {
          console.error('No se pudo obtener la ubicación:', error);
          alert('No se pudo obtener tu ubicación. Asegúrate de permitir el acceso al GPS.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }

  private initMap(lat: number, lng: number) {
    this.map = L.map('mapId').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Marcador en la ubicación actual
    L.marker([lat, lng]).addTo(this.map)
      .bindPopup('Tu ubicación')
      .openPopup();

    // Forzar refresco del tamaño del mapa
    setTimeout(() => this.map.invalidateSize(), 500);
  }
    async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
