export interface Reporte {
  id: string;
  enProceso: boolean;
  fecha: any; // puedes poner Timestamp si usas Firebase
  coordenadas: { lat: number; lng: number };
  ubicacion: string;
  fotoURL?: string;
  descripcion?: string;
  pendiente?: boolean;
  resuelto?: boolean;
  usuarioEmail?: string;
  usuarioUID?: string;
  visibilidad: boolean;
  tipo?: string; // si lo usas
}