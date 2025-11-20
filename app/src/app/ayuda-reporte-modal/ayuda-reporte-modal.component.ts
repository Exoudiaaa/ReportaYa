import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ayuda-reporte-modal',
  templateUrl: './ayuda-reporte-modal.component.html',
  styleUrls: ['./ayuda-reporte-modal.component.scss'],
  standalone: false,
})
export class AyudaReporteModalComponent  implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}

}
