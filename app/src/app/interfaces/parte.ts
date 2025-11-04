export interface Parte {
  id: string;
  fecha: Date | string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  ubicacion: string;
  fotoURL1?: string;
  fotoURL2?: string;
  fotoURL3?: string;
  patente?: string;
  comentarios?: string;
  infraccion?: string;
  usuarioEmail?: string;
  usuarioUID?: string;
  tipo?: string;
  marca?: string;
  color?: string;
}
