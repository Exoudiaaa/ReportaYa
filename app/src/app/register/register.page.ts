// src/app/register/register.page.ts
import { Component } from '@angular/core';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  constructor(private authService: Auth, private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const firstName = (form.querySelector('#firstName') as HTMLInputElement).value;
    const lastName = (form.querySelector('#lastName') as HTMLInputElement).value;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const phone = (form.querySelector('#phone') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;
    const confirmPassword = (form.querySelector('#confirmPassword') as HTMLInputElement).value;

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const user = await this.authService.registerUser({ firstName, lastName, email, phone, password });

    if (user) {
      alert('Usuario creado con éxito');
      this.router.navigate(['/login']);
    } else {
      alert('Hubo un error al registrar el usuario');
    }
  }
}
