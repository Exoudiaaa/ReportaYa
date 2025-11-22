import { Component } from '@angular/core';
import { Auth } from 'src/app/services/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SocialLogin } from '@capgo/capacitor-social-login';

import { OnInit } from '@angular/core'; // 👈 Agrega OnInit
import { filter, first, switchMap, of } from 'rxjs'; // 👈 Importa operadores

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  passwordVisible = false;
  passwordType = 'password';
  
  errores = {
    email: false,
    password: false
  };

  constructor(
    private authService: Auth,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // ✅ Verifica si ya hay un usuario al cargar la página
    this.authService.authStatusReady$.pipe(
      first(),
      filter(ready => ready),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        if (user) {
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
        return of(null);
      })
    ).subscribe();
  }



  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
    this.passwordType = this.passwordVisible ? 'text' : 'password';
  }


  


  async onSubmit(event: Event) {
    event.preventDefault();

    // Reiniciar errores
    this.errores = { email: false, password: false };

    // Validar formato
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailValido = emailRegex.test(this.email);
    const passwordValida = this.password.length >= 6;

    // Borrar y marcar errores
    if (!emailValido) { this.errores.email = true; this.email = ''; }
    if (!passwordValida) { this.errores.password = true; this.password = ''; }

    if (!emailValido || !passwordValida) {
      const alert = await this.alertCtrl.create({
        header: 'Datos inválidos',
        message: 'Verifica que el correo sea válido y la contraseña tenga al menos 6 caracteres.',
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
        this.errores.email = true;
        this.errores.password = true;
        this.email = '';
        this.password = '';
        const alert = await this.alertCtrl.create({
          header: 'Error de autenticación',
          message: 'Correo o contraseña incorrectos.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error: any) {
      let mensaje = 'No se pudo iniciar sesión. Verifica tu conexión.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        mensaje = 'Correo o contraseña incorrectos.';
        this.errores.email = true;
        this.errores.password = true;
        this.email = '';
        this.password = '';
      }

      const alert = await this.alertCtrl.create({ header: 'Error', message: mensaje, buttons: ['OK'] });
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
        message: 'No se pudo iniciar sesión con Google.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}