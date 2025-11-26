import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
export interface Ubicacion {
  lat?: number;
  lng?: number;
  address?: string;   // dirección completa
  display?: string;   // dirección resumida (ej: "San Bernardo, Eyzaguirre 737")
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<Ubicacion | null>(null);
  location$ = this.locationSubject.asObservable();
  private watchId: number | null = null;
  private LOCATIONIQ_KEY = 'pk.5b6df700376c8e94f79168a449497666'; // 🔹 reemplaza con tu key de LocationIQ

  constructor() {}

  // Establece la ubicación en el BehaviorSubject
  setLocation(loc: Ubicacion) {
    const display = loc.display ?? (
      (loc.lat !== undefined && loc.lng !== undefined)
        ? `Lat: ${loc.lat.toFixed(5)}, Lng: ${loc.lng.toFixed(5)}`
        : ''
    );
    this.locationSubject.next({ ...loc, display });
  }

  getCurrentSnapshot(): Ubicacion | null {
    return this.locationSubject.value;
  }

  clear() {
    this.locationSubject.next(null);
  }

  /**
   * Hace reverse geocoding con LocationIQ
   */
  async fetchAddress(lat: number, lng: number) {
    try {
      const url = `https://us1.locationiq.com/v1/reverse.php?key=${this.LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data) {
        this.setLocation({ lat, lng, display: 'Ubicación no disponible' });
        return;
      }

      // Dirección completa
      const fullAddress = data.display_name || '';

      // Dirección resumida: calle + número + comuna
      const simple = this.simplifyAddress(data.address);

      this.setLocation({
        lat,
        lng,
        address: fullAddress,
        display: simple
      });

    } catch (err) {
      console.error('Error geocoding inverso LocationIQ:', err);
      this.setLocation({ lat, lng, display: 'Ubicación no disponible' });
    }
  }

  /**
 * Extrae solo calle + número + comuna + región
 */
private simplifyAddress(addr: any): string {
  if (!addr) return 'Ubicación no disponible';

  const road = addr.road || '';
  const house_number = addr.house_number || '';
  const city = addr.city || addr.town || addr.village || '';
  const state = addr.state || ''; // Región

  let simple = '';
  if (road) simple += road;
  if (house_number) simple += ` ${house_number}`;
  if (city) simple += city ? `, ${city}` : '';

  return simple.trim();
}
startWatching() {
  if ('geolocation' in navigator) {
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        this.setLocation({ lat, lng });
        this.fetchAddress(lat, lng);
      },
      (err) => {
        console.error('Error al obtener ubicación continua:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  }
}

stopWatching() {
  if (this.watchId !== null) {
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
  }
}

}