import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-camaras',
  templateUrl: './camaras.page.html',
  styleUrls: ['./camaras.page.scss'],
  standalone: false
})
export class CamarasPage implements OnInit {

  nombre: string = '';
  apellido: string = '';
  rut: string = '';
  telefono: string = '';
  nRegistro: string = '';
  calle: string = '';
  motivo: string = '';
  
  displayFechaHora: string = '';

  constructor(
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private router: Router,
    private auth: Auth   // <-- Agregado
  ) {}

  ngOnInit() {}

  onDatetimeChange(event: any) {
    this.displayFechaHora = event.detail.value;
  }

  // ✅ Solo letras (incluye tildes y espacios)
  validarLetras(event: any, campo: string) {
    const valor = event.target.value;
    const soloLetras = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    switch (campo) {
      case 'nombre': this.nombre = soloLetras; break;
      case 'apellido': this.apellido = soloLetras; break;
      case 'motivo': this.motivo = soloLetras; break;
    }
  }

  // ✅ RUT: letras, números, guion y puntos
  validarRut(event: any) {
    const valor = event.target.value;
    const rutValido = valor.replace(/[^0-9kK\-.]/g, '');
    this.rut = rutValido;
  }

  // ✅ Solo números
  validarNumeros(event: any) {
    const valor = event.target.value;
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    this.telefono = soloNumeros;
  }

  // ✅ Calle: letras, números, espacios, puntos y #
  validarDireccion(event: any) {
    const valor = event.target.value;
    const direccionValida = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.#-]/g, '');
    this.calle = direccionValida;
  }

  // 🧩 Verificación de caracteres válidos
  camposValidos(): boolean {
    const letras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const rutRegex = /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-?[0-9kK]{1}$/; // formato RUT
    const numeros = /^[0-9]{7,12}$/; // teléfono entre 7 y 12 dígitos
    const direccion = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.#-]{3,100}$/;
    const motivoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,200}$/;

    return (
      letras.test(this.nombre) &&
      letras.test(this.apellido) &&
      rutRegex.test(this.rut) &&
      numeros.test(this.telefono) &&
      direccion.test(this.calle) &&
      motivoRegex.test(this.motivo)
    );
  }

  async guardarSolicitud() {
  const usuario = (await this.auth.currentUser);
  if (!usuario) return;

  if (!this.camposValidos()) {
    const alert = await this.alertCtrl.create({
      header: 'Datos inválidos',
      message: 'Verifica que todos los campos contengan caracteres válidos y en el formato correcto.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  if (!this.nombre || !this.apellido || !this.rut || !this.telefono || !this.nRegistro || !this.calle || !this.motivo || !this.displayFechaHora) {
    const alert = await this.alertCtrl.create({
      header: 'Campos incompletos',
      message: 'Todos los campos son obligatorios.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  try {
    const colRef = collection(this.firestore, 'camaras');
    await addDoc(colRef, {
      nombre: this.nombre,
      apellido: this.apellido,
      rut: this.rut,
      telefono: this.telefono,
      nRegistro: this.nRegistro,
      calle: this.calle,
      motivo: this.motivo,
      fecha: this.displayFechaHora,
      usuarioUID: usuario.uid 
    });

    const alert = await this.alertCtrl.create({
      header: 'Solicitud enviada',
      message: 'La solicitud de cámara fue registrada correctamente.',
      buttons: [{
        text: 'OK',
        handler: () => this.router.navigate(['/home'])
      }]
    });
    await alert.present();

  } catch (err) {
    console.error('Error guardando solicitud:', err);
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudo guardar la solicitud. Intente nuevamente.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
}