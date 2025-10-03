import { Component, OnInit } from '@angular/core';
import { Auth } from 'src/app/services/auth';
import { Router } from '@angular/router';
import { SocialLogin } from '@capgo/capacitor-social-login'
import { getAuth, signInWithCredential, GoogleAuthProvider } from '@angular/fire/auth';
import { get } from 'firebase/database';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  isWeb = false;
  firebase: any;
  loginResponse: any;
  token: any;
  constructor(private authService: Auth, private router: Router) { }

  ngOnInit() {
  }
  async onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;

    const user = await this.authService.loginUser(email, password);

    if (user) {
      this.router.navigate(['/home']);
      console.log("login exitoso");
    } else {
      alert('Hubo un error al iniciar sesión');
    }
  }
  async loginGoogle() {
    try {
      const res: any = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile']
        }
      });

      // El idToken está dentro de result
      const idToken = res.result.idToken;
      const accessToken = res.result.accessToken.token;
      const userProfile = res.result.profile;

      console.log('ID Token:', idToken);
      console.log('Access Token:', accessToken);
      console.log('User Profile:', userProfile);

      // Aquí puedes usar el idToken para autenticar con tu backend
      if (idToken) {
        await this.authService.loginWithGoogle(idToken);
      }

      return {
        idToken: idToken,
        accessToken: accessToken,
        profile: userProfile
      };

    } catch (error) {
      console.error('Error en login Google:', error);
      throw error;
    }
  }
}