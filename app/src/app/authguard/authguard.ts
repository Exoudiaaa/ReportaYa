import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, switchMap, first } from 'rxjs';
import { Auth } from '../services/auth'; // 👈 Ajusta la ruta según tu estructura

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad, CanActivate {

  constructor(private authService: Auth, private router: Router) {}

  // Para rutas con loadChildren
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> {
    return this.checkAuth();
  }

  // Para rutas con component
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean> {
    return this.authService.authStatusReady$.pipe(
      first(),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        if (user) {
          return of(true);
        } else {
          this.router.navigate(['/login']);
          return of(false);
        }
      })
    );
  }
}