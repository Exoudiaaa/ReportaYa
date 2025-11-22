import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';

import {
  Feature,
  Polygon,
  MultiPolygon,
  FeatureCollection
} from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class ComunaService {

  private comunaData: FeatureCollection | null = null;

  constructor() {
    this.cargarComuna();
  }

  async cargarComuna() {
    const resp = await fetch('assets/PRC_San_Bernardo.geojson');
    this.comunaData = await resp.json();
  }

  async puntoEnComuna(lat: number, lng: number): Promise<boolean | null> {
    if (!this.comunaData) return null;

    const point = turf.point([lng, lat]);

    // Recorremos TODOS los polígonos
    for (const f of this.comunaData.features) {
      if (!f.geometry) continue;

      if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
        const poly = turf.feature(f.geometry);

        // Si coincide con alguno → ESTÁ DENTRO
        if (turf.booleanPointInPolygon(point, poly)) {
          return true;
        }
      }
    }

    // No calzó con ninguno → ESTÁ FUERA
    return false;
  }
}