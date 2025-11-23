import { Component, ViewChild } from '@angular/core';
import { Auth } from './services/auth'; // 👈 Ajusta la ruta si es necesario
import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { App as CapacitorApp} from '@capacitor/app'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet!: IonRouterOutlet;
  constructor(
    public auth: Auth, // ✅ Inyecta el servicio corregido
    private platform: Platform,
    private location: Location,
    private router: Router,
    private alertController: AlertController
  ) {
    this.configureHardwareBackButton();
    this.initSocialLogin();
  }

   configureHardwareBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {

      // 1️⃣ Si hay algo en el stack para volver, volver normalmente
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.routerOutlet.pop();
        return;
      }

      // 2️⃣ Si estamos en home → pedir confirmación antes de salir
      if (this.router.url === '/home') {
        const alert = await this.alertController.create({
          header: 'Salir',
          message: '¿Deseas salir de la aplicación?',
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Salir',
              handler: () => {
                (navigator as any).app.exitApp();
              }
            }
          ]
        });
        await alert.present();
        return;
      }

      // 3️⃣ Si está en login → no permitir volver atrás (evita regresar sin logout)
      if (this.router.url === '/login') {
        return;
      }

      // 4️⃣ Si no hay donde volver → regresar al home
      this.router.navigateByUrl('/home', { replaceUrl: true });
    });
  }


  async initSocialLogin() {
    await SocialLogin.initialize({
      google: {
        webClientId: '102037866021-8jmum6fhgrhbpac4c6ckk3rfbbecskvs.apps.googleusercontent.com',
        mode: 'online'
      }
    });
    console.log('SocialLogin inicializado');
  }
}