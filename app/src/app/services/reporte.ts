import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Reporte {
   constructor(private firestore: Firestore) {}

  obtenerReportes(): Observable<any[]> {
    const reportesRef = collection(this.firestore, 'reportes');
    // collectionData convierte los documentos en un array y agrega el id
    return collectionData(reportesRef, { idField: 'id' });
  }
}
