import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  private MAPBOX_TOKEN = 'TU_MAPBOX_KEY'; // 🔹 tu access token de Mapbox

  constructor() {}

  /**
   * Establece la ubicación en el BehaviorSubject.
   * Si no se pasa display, intenta generarlo automáticamente.
   */
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
   * Hace reverse geocoding con Mapbox para obtener dirección legible
   */
  async fetchAddress(lat: number, lng: number) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.features || data.features.length === 0) {
        this.setLocation({ lat, lng, display: 'Ubicación no disponible' });
        return;
      }

      const feature = data.features[0];

      // dirección completa
      const fullAddress = feature.place_name || '';

      // dirección resumida (solo comuna + calle + número)
      const simple = this.simplifyAddress(feature);

      this.setLocation({
        lat,
        lng,
        address: fullAddress,
        display: simple
      });

    } catch (err) {
      console.error('Error geocoding inverso:', err);
      this.setLocation({ lat, lng, display: 'Ubicación no disponible' });
    }
  }

  /**
   * Extrae solo comuna + calle + número de la feature de Mapbox
   */
  private simplifyAddress(feature: any): string {
    if (!feature) return 'Ubicación no disponible';

    let city = '';
    let road = '';
    let house_number = '';

    // Mapbox devuelve "context" para partes de la dirección
    if (feature.context) {
      feature.context.forEach((c: any) => {
        if (c.id.startsWith('place')) city = c.text;
        if (c.id.startsWith('address')) {
          const parts = c.text.split(' ');
          house_number = parts.pop() || '';
          road = parts.join(' ') || '';
        }
      });
    }

    // A veces el feature mismo tiene road
    if (feature.text && !road) road = feature.text;

    let simpleAddress = '';
    if (city) simpleAddress += city;
    if (road) simpleAddress += ', ' + road;
    if (house_number) simpleAddress += ' ' + house_number;

    return simpleAddress.trim();
  }
}