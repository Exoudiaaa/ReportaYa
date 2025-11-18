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
  constructor(
    private authService: Auth,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  // 🧩 Validaciones al enviar
  async onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const firstName = (form.querySelector('#firstName') as HTMLInputElement)?.value.trim() || '';
    const lastName = (form.querySelector('#lastName') as HTMLInputElement)?.value.trim() || '';
    const email = (form.querySelector('#email') as HTMLInputElement)?.value.trim() || '';
    const phone = (form.querySelector('#phone') as HTMLInputElement)?.value.replace(/\D/g, '') || ''; // solo dígitos
    const password = (form.querySelector('#password') as HTMLInputElement)?.value || '';
    const confirmPassword = (form.querySelector('#confirmPassword') as HTMLInputElement)?.value || '';

    // ✅ Validación: coincidencia de contraseñas
    if (password !== confirmPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Contraseñas no coinciden',
        message: 'Las contraseñas ingresadas no son iguales.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // 🧪 Regex
    const letras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const telefonoRegex = /^[0-9]{9}$/; // 9 dígitos exactos
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // 8+ chars, mayús, minús, número

    // ✅ Validación de formato
    if (
      !letras.test(firstName) ||
      !letras.test(lastName) ||
      !emailRegex.test(email) ||
      !telefonoRegex.test(phone) ||
      !passwordRegex.test(password)
    ) {
      const alert = await this.alertCtrl.create({
        header: 'Datos inválidos',
        message: 'Verifica que:\n• Nombre y apellido solo tengan letras\n• El correo sea válido\n• El teléfono tenga 9 dígitos (sin espacios)\n• La contraseña tenga al menos 8 caracteres, con mayúsculas, minúsculas y números',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      const user = await this.authService.registerUser({
        firstName,
        lastName,
        email,
        phone,
        password,
        rango: 'ciudadano'
      });

      if (user) {
        const alert = await this.alertCtrl.create({
          header: '¡Cuenta creada!',
          message: 'Tu cuenta se ha registrado correctamente. Ahora puedes iniciar sesión.',
          buttons: [{
            text: 'OK',
            handler: () => this.router.navigate(['/login'])
          }]
        });
        await alert.present();
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Error de registro',
          message: 'El correo ya está en uso o no se pudo crear la cuenta.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Error:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Ocurrió un problema. Por favor, inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}