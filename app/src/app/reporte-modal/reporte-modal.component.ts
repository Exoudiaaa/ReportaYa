import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Reporte } from '../services/reporte';
import { Reporte as report } from '../interfaces/reporte';
@Component({
  selector: 'app-reporte-modal',
  templateUrl: './reporte-modal.component.html',
  styleUrls: ['./reporte-modal.component.scss'],
  standalone: false
})
export class ReporteModalComponent {
  @Input() reporte!: report;

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
