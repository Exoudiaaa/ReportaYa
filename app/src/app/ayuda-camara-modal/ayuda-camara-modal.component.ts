import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ayuda-camara-modal',
  templateUrl: './ayuda-camara-modal.component.html',
  styleUrls: ['./ayuda-camara-modal.component.scss'],
   standalone: false,
})
export class AyudaCamaraModalComponent  implements OnInit {

  constructor(private modalCtrl: ModalController) { }


   cerrar() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}

}
