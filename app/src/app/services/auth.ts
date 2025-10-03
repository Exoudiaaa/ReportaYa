import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth as FirebaseAuth, createUserWithEmailAndPassword, User, signInWithEmailAndPassword,getAuth, setPersistence, browserLocalPersistence,signOut, GoogleAuthProvider, signInWithCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { set } from 'firebase/database';
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
  async logout(){
    try{
      await signOut(this.auth);
    }
    catch(err){
      console.error('Error al cerrar sesión:', err);
    }
  }
  async loginWithGoogle(idToken: string) {
    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(this.auth, credential);
  }
}
