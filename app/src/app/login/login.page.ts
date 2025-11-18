import { Component } from '@angular/core';
import { Auth } from 'src/app/services/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SocialLogin } from '@capgo/capacitor-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';
  passwordVisible = false;
  passwordType = 'password';

  constructor(
    private authService: Auth,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
    this.passwordType = this.passwordVisible ? 'text' : 'password';
  }

  camposValidos(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.email) && this.password.length >= 6;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (!this.camposValidos()) {
      const alert = await this.alertCtrl.create({
        header: 'Datos inválidos',
        message: 'Por favor ingresa un correo válido y una contraseña de al menos 6 caracteres.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      const user = await this.authService.loginUser(this.email, this.password);
      if (user) {
        const alert = await this.alertCtrl.create({
          header: '¡Bienvenido!',
          message: 'Inicio de sesión exitoso.',
          buttons: [{
            text: 'OK',
            handler: () => this.router.navigate(['/tabs/home'], { replaceUrl: true })
          }]
        });
        await alert.present();
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Error de autenticación',
          message: 'Correo o contraseña incorrectos. Inténtalo nuevamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      let mensaje = 'No se pudo iniciar sesión. Verifica tu conexión e inténtalo de nuevo.';

      if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo no es válido.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        mensaje = 'Correo o contraseña incorrectos.';
      }

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: mensaje,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async loginGoogle() {
    try {
      const res: any = await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['email', 'profile'] }
      });

      const idToken = res.result.idToken;
      if (idToken) {
        await this.authService.loginWithGoogle(idToken);
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      }
    } catch (error) {
      console.error('Error en login Google:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error con Google',
        message: 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}