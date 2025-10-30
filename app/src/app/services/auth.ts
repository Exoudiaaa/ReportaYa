import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth as FirebaseAuth, createUserWithEmailAndPassword, User, signInWithEmailAndPassword, signInWithPhoneNumber, getAuth, setPersistence, browserLocalPersistence, signOut, GoogleAuthProvider, signInWithCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc,getDoc, serverTimestamp } from '@angular/fire/firestore';
import { set } from 'firebase/database';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { RecaptchaVerifier } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private auth: FirebaseAuth = inject(FirebaseAuth);
  private firestore: Firestore = inject(Firestore);
  constructor(private router: Router) {
    this.setPersistence();
  }

  setPersistence() {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Persistencia establecida en local');
      })
      .catch((error) => {
        console.error('Error al establecer persistencia:', error);
      });
  }
  async registerUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    rango:string;
  }): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
      const user = userCredential.user;

      await setDoc(doc(this.firestore, 'users', user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        createdAt: new Date(),
        rango: data.rango
      });

      console.log('Usuario registrado y guardado en Firestore:', user.uid);
      return user;
    } catch (err) {
      console.error('Error en registerUser:', err);
      return null;
    }
  }
  async loginUser(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      console.log('Usuario logueado:', user.uid);
      return user;
    } catch (err) {
      console.error('Error en loginUser:', err);
      return null;
    }
  }
  async logout() {
    try {
      await signOut(this.auth);
    }
    catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }
  async loginWithGoogle(idToken: string) {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(this.auth, credential);
    const user = result.user;

    const profile = result.user.providerData[0]; // viene de Google
    console.log(profile);
    await setDoc(doc(this.firestore, 'users', user.uid), {
      firstName: profile.displayName?.split(' ')[0] || '',
      lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
      email: profile.email,
      phone: user.phoneNumber || '',
      photoURL: profile.photoURL || '',
      createdAt: new Date(),
      rango: "ciudadano",
    }, { merge: true });

    return user;
  }
  async registerPhoneUserWeb(phone: string, recaptchaVerifier: RecaptchaVerifier) {
    try {
      console.log("Registrando usuario web con número:", phone);

      const confirmationResult = await signInWithPhoneNumber(this.auth, phone, recaptchaVerifier);
      console.log("SMS enviado correctamente (web)");

      return confirmationResult; // Se devuelve para luego confirmar con el OTP
    } catch (error) {
      console.error("Error en registerPhoneUserWeb:", error);
      throw error;
    }
  }
  async registerPhoneUserNative(phone: string) {
    try {
      console.log("Registrando usuario nativo con número:", phone);

      await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber: phone });
      const { user } = await FirebaseAuthentication.getCurrentUser();

      if (user) {
        await setDoc(doc(this.firestore, 'users', user.uid), {
          uid: user.uid,
          phone: phone,
          createdAt: serverTimestamp()
        });
        console.log("Usuario nativo registrado en Firestore:", user.uid);
        return user;
      } else {
        throw new Error("No se pudo obtener el usuario actual");
      }
    } catch (error) {
      console.error("Error en registerPhoneUserNative:", error);
      throw error;
    }
  }
  async getCurrentUserData(): Promise<any | null> {
  try {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.warn('No hay usuario autenticado.');
      return null;
    }

    const userRef = doc(this.firestore, 'users', currentUser.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    } else {
      console.warn('El documento del usuario no existe en Firestore.');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    return null;
  }
}
}
