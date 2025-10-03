import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private auth: Auth = inject(Auth);
  
  constructor(private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          // Usuario AUTENTICADO - permitir acceso
          resolve(true);
        } else {
          // Usuario NO autenticado - redirigir al login
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}