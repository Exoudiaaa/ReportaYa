import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DATA } from '../../assets/data';
import { Router } from '@angular/router';



interface Familia {
  id: number;
  nickname: string;
  name: string;
  icon: string;
  color: string;
}
  



@Component({
  selector: 'app-reportar',
  templateUrl: './reportar.page.html',
  styleUrls: ['./reportar.page.scss'],
  standalone: false

  
})
export class ReportarPage implements OnInit {

constructor(private router: Router) {}

  ngOnInit(): void {
    
  }
  public familias: Familia[] = [
    { id: 1, nickname: 'Accidentes y emergencias', 
      name: 'Accidentes y emergencias', 
      icon: 'flame', 
      color: 'linear-gradient(135deg, #d4145a, #fbb03b)' },

    { id: 2, nickname: 'Intervencion municipal', 
      name: 'Acciones en patrullaje municipal', 
      icon: 'car', 
      color: 'linear-gradient(135deg, #8e2de2, #4a00e0)'  },

    { id: 3, nickname: 'Delitos con armas', 
      name: 'Delitos asociados a armas', 
      icon: 'hammer', 
      color: 'linear-gradient(135deg, #ff69b4, #ff1493)'  },

    { id: 4, nickname: 'Delitos con drogas', 
      name: 'Delitos asociados a drogas', 
      icon: 'skull', 
      color: 'linear-gradient(135deg, #f7971e, #ffd200)'  },

    { id: 5, nickname: 'Delitos sin violencia', 
      name: 'Delitos contra la propiedad no violentos', 
      icon: 'home' , 
      color: 'linear-gradient(135deg, #00ff7f, #32cd32)' },

    { id: 6, nickname: 'Delitos con violencia', 
      name: 'Delitos violentos', 
      icon: 'hand-right' , 
      color: 'linear-gradient(135deg, #00c6ff, #0072ff)' },

    { id: 7, nickname: 'Incivilidades / molestias',
      name: 'Incivilidades', 
      icon: 'ear' , 
      color: 'linear-gradient(135deg, #40e0d0, #00ced1)' },

    { id: 8, nickname: 'Otros problemas', 
      name: 'Otros delitos o faltas', 
      icon: 'information' , 
      color: 'linear-gradient(135deg, #7f8c8d, #bdc3c7)' },
  ];


    selectFamilia(familia: Familia) {
    console.log('Seleccionaste:', familia.name);
    // Navega a formulario-reporte y pasa el nickname como parámetro
  this.router.navigate(['/formulario-reporte', { nombre: familia.nickname , icono: familia.icon, color: familia.color}]);
  
  }
}


