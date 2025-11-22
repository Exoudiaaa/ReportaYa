import { Component, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Reporte } from '../services/reporte';
import { Reporte as report } from '../interfaces/reporte';
@Component({
  selector: 'app-reporte-modal',
  templateUrl: './reporte-modal.component.html',
  styleUrls: ['./reporte-modal.component.scss'],
  standalone: false
})
export class ReporteModalComponent {
  reporte: any;

  constructor(private modalCtrl: ModalController,
    private navParams: NavParams) {}

  ngOnInit() {
    this.reporte = this.navParams.get('reporte') || {};
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
