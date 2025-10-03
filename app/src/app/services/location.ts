import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Ubicacion {
  lat?: number;
  lng?: number;
  address?: string;   // opcional: dirección legible si haces reverse geocoding
  display?: string;   // texto listo para mostrar (ej: "Av. X 123" o "Lat..., Lng...")
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<Ubicacion | null>(null);
  location$ = this.locationSubject.asObservable();

  setLocation(loc: Ubicacion) {
    // si no viene display, generamos uno con lat/lng
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
}