import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Auth as FirebaseService } from "src/app/services/auth";

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.page.html',
  styleUrls: ['./phone-login.page.scss'],
  standalone: false
})
export class PhoneLoginPage implements OnInit {
  phoneNumber: string = '';
  otp: string = '';
  recaptchaVerifier!: RecaptchaVerifier;
  confirmationResult?: ConfirmationResult; // Solo Web
  isOTPSent: boolean = false;
  resendTimer: number = 0;
  resendDisabled: boolean = false;

  constructor(private router: Router, private authService: FirebaseService, private auth: Auth, private firestore: Firestore) { }

  ngOnInit(): void {
    if (!Capacitor.isNativePlatform()) {
      // Solo Web necesitamos reCAPTCHA
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA verificado:', response);
        }
      });
    }
  }

  formatToChile(raw: string): string {
    if (!raw) return raw;
    let n = raw.replace(/[\s\-\.\(\)]/g, '');
    if (n.startsWith('+')) return n;
    if (n.startsWith('56')) return '+' + n;
    n = n.replace(/^0+/, '');
    return '+56' + n;
  }

   async sendOTP() {
    const formattedNumber = this.formatToChile(this.phoneNumber);
    console.log("📤 Enviando SMS a:", formattedNumber);

    try {
      this.isOTPSent = true;
      this.startResendTimer();

      if (Capacitor.isNativePlatform()) {
        // Flujo nativo (Android/iOS)
        const user = await this.authService.registerPhoneUserNative(formattedNumber);
        alert(`Inicio de sesión exitoso: ${user.phoneNumber}`);
        this.router.navigate(['/home']);
      } else {
        // Flujo Web
        this.confirmationResult = await this.authService.registerPhoneUserWeb(formattedNumber, this.recaptchaVerifier);
        alert('Código SMS enviado. Ingresa el código para continuar.');
      }

    } catch (error) {
      console.error('❌ Error enviando OTP:', error);
      alert('Error al enviar el código. Verifica el número e inténtalo de nuevo.');
    }
  }

  // Verificar OTP (solo web)
  async verifyOTP() {
    try {
      if (!this.confirmationResult) {
        alert("Primero envía el código SMS.");
        return;
      }

      const result = await this.confirmationResult.confirm(this.otp);
      const user = result.user;

      // Guardar usuario en Firestore después de verificar
      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid,
        phone: user.phoneNumber,
        createdAt: serverTimestamp()
      });

      console.log('✅ Usuario web registrado en Firestore:', user.uid);
      alert(`Inicio de sesión exitoso: ${user.phoneNumber}`);
      this.router.navigate(['/home']);

    } catch (error) {
      console.error("❌ Error verificando OTP:", error);
      alert('Código incorrecto o expirado.');
    }
  }
  startResendTimer() {
    this.resendTimer = 60;
    this.resendDisabled = true;

    const interval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(interval);
        this.resendDisabled = false;
      }
    }, 1000);
  }
}
