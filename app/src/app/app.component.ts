import { Component } from '@angular/core';
import { Auth } from './services/auth'; // 👈 Ajusta la ruta si es necesario
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SocialLogin } from '@capgo/capacitor-social-login';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    public auth: Auth, // ✅ Inyecta el servicio corregido
    private platform: Platform,
    private location: Location,
    private router: Router
  ) {
    this.initializeBackButtonCustomHandler();
    this.initSocialLogin();
  }

  initializeBackButtonCustomHandler() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
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