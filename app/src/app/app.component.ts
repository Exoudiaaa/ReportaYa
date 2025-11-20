import { Component } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SocialLogin } from '@capgo/capacitor-social-login';


import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private auth = inject(Auth);

  constructor(private router: Router,private platform: Platform,private location: Location) {

    this.initializeBackButtonCustomHandler();
    
    
    this.initSocialLogin();

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // Usuario ya logueado
        this.router.navigate(['/home']);
      } else {
        // Usuario no logueado
        this.router.navigate(['/login']);
      }
    });
  }

  initializeBackButtonCustomHandler() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();  // <-- vuelve atrás
    });
  }

  
   async initSocialLogin() {
    await SocialLogin.initialize({
      google: {
        webClientId: '102037866021-8jmum6fhgrhbpac4c6ckk3rfbbecskvs.apps.googleusercontent.com',
        mode  : 'online'
      }
    }); console.log('SocialLogin inicializado');
  }
}