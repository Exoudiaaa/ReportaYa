import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false
})
export class MenuPage implements OnInit {

  constructor(
    private router: Router,
    private auth: Auth,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
  }

   async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesión',
          handler: async () => {
            await signOut(this.auth);
            this.router.navigate(['/login']);
          },
        },
      ],
    });

    await alert.present();
}



abrirHistorial() {
  this.router.navigate(['/historial']);
}



// Funcion para abrir historial de cámaras(no podia poner otro nombr)
abrirMenuPrincipal() { 
  this.router.navigate(['/historial-camaras']);
}





}

