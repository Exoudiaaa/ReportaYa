import { Component } from '@angular/core';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  // Campos del formulario
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  // Estado de errores
  errores = {
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  };

  constructor(
    private authService: Auth,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    // Reiniciar errores
    this.errores = {
      firstName: false,
      lastName: false,
      email: false,
      phone: false,
      password: false,
      confirmPassword: false
    };

    // Validar coincidencia de contraseñas
    if (this.password !== this.confirmPassword) {
      this.errores.password = true;
      this.errores.confirmPassword = true;
      this.password = '';
      this.confirmPassword = '';
      this.mostrarAlerta('Contraseñas no coinciden', 'Las contraseñas no son iguales.');
      return;
    }

    // Regex
    const letras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const telefonoRegex = /^[0-9]{9}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Validar cada campo y borrar si es inválido
    if (!letras.test(this.firstName)) { this.errores.firstName = true; this.firstName = ''; }
    if (!letras.test(this.lastName)) { this.errores.lastName = true; this.lastName = ''; }
    if (!emailRegex.test(this.email)) { this.errores.email = true; this.email = ''; }
    if (!telefonoRegex.test(this.phone.replace(/\D/g, ''))) { this.errores.phone = true; this.phone = ''; }
    if (!passwordRegex.test(this.password)) { this.errores.password = true; this.password = ''; this.errores.confirmPassword = true; this.confirmPassword = ''; }

    // Si hay errores, mostrar alerta
    if (Object.values(this.errores).some(e => e)) {
      this.mostrarAlerta(
        'Datos inválidos',
        'Algunos campos no cumplen con el formato requerido. Los campos incorrectos se han borrado.'
      );
      return;
    }

    // ✅ Registrar usuario
    try {
      const user = await this.authService.registerUser({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone.replace(/\D/g, ''),
        password: this.password,
        rango: 'ciudadano'
      });

      if (user) {
        this.mostrarAlerta(
          '¡Cuenta creada!',
          'Tu cuenta se ha registrado correctamente. Ahora puedes iniciar sesión.',
          true
        );
      } else {
        this.mostrarAlerta('Error de registro', 'El correo ya está en uso.');
      }
    } catch (error) {
      console.error('Error:', error);
      this.mostrarAlerta('Error', 'Ocurrió un problema. Inténtalo de nuevo.');
    }
  }

  private async mostrarAlerta(header: string, message: string, navigateToLogin = false) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();

    if (navigateToLogin) {
      alert.onDidDismiss().then(() => this.router.navigate(['/login']));
    }
  }
}