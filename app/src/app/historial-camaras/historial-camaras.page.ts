import { Component, OnInit } from '@angular/core';

import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { query, where, orderBy } from 'firebase/firestore';

@Component({
  selector: 'app-historial-camaras',
  templateUrl: './historial-camaras.page.html',
  styleUrls: ['./historial-camaras.page.scss'],
  standalone: false
})
export class HistorialCamarasPage implements OnInit {
  camaras: any[] = [];
  cargando: boolean = true;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit() {
    this.cargarHistorialCamaras();
  }

  cargarHistorialCamaras() {
    const usuario = this.auth.currentUser;
    if (!usuario) return;

    const camarasRef = collection(this.firestore, 'camaras');
    const q = query(camarasRef, where('usuarioUID', '==', usuario.uid)); // Filtra por usuario

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      // Convertimos fecha a timestamp si viene como string
      this.camaras = data
        .map(c => ({
          ...c,
          fecha: c.fecha?.seconds ? c.fecha : new Date(c.fecha) // convierte si es string
        }))
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Descendente

      this.cargando = false;
    });
  }

  convertirFecha(fecha: any): string {
    if (!fecha) return 'Fecha no disponible';
    const date = fecha.seconds ? new Date(fecha.seconds * 1000) : new Date(fecha);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
