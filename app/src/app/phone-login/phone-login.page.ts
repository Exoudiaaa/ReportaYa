// phone-login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.page.html',
  styleUrls: ['./phone-login.page.scss'],
  standalone: false,
})
export class PhoneLoginPage {
  phoneNumber: string = ''; // Número completo con código de país, ej: +569XXXXXXXX
  isLoading: boolean = false;

  constructor(private router: Router) {}

  async loginWithPhone() {
    if (!this.phoneNumber) {
      alert('Ingresa un número de teléfono válido.');
      return;
    }

    this.isLoading = true;

    try {
      // Envía el SMS al número
      await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber: this.phoneNumber
      });

      // Obtiene el usuario actual
      const user = await FirebaseAuthentication.getCurrentUser();

      if (user) {
        console.log('Usuario autenticado:', user);
        // Redirige al home
        this.router.navigate(['/home']);
      } else {
        alert('No se pudo autenticar el usuario.');
      }
    } catch (error: any) {
      console.error('Error en login con número:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      this.isLoading = false;
    }
  }
}
