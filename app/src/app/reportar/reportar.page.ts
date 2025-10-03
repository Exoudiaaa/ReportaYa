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
    { id: 1, nickname: 'Accidentes y urgencias', name: 'Accidentes y emergencias', icon: 'flame', color: 'red' },
    { id: 2, nickname: 'Intervencion municipal', name: 'Acciones en patrullaje municipal', icon: 'car', color: 'purple'  },
    { id: 3, nickname: 'Delitos con armas', name: 'Delitos asociados a armas', icon: 'hammer', color: 'black'  },
    { id: 4, nickname: 'Delitos con drogas', name: 'Delitos asociados a drogas', icon: 'skull', color: 'orange'  },
    { id: 5, nickname: 'Robos sin violencia', name: 'Delitos contra la propiedad no violentos', icon: 'home' , color: 'green' },
    { id: 6, nickname: 'Delitos con violencia', name: 'Delitos violentos', icon: 'hand-right' , color: 'blue' },
    { id: 7, nickname: 'Incivilidades / molestias', name: 'Incivilidades', icon: 'ear' , color: 'red' },
    { id: 8, nickname: 'Otros problemas', name: 'Otros delitos o faltas', icon: 'information' , color: 'grey' },
  ];


    selectFamilia(familia: Familia) {
    console.log('Seleccionaste:', familia.name);
    // Navega a formulario-reporte y pasa el nickname como parámetro
  this.router.navigate(['/formulario-reporte', { nombre: familia.nickname , icono: familia.icon, color: familia.color}]);
  
  }
}


