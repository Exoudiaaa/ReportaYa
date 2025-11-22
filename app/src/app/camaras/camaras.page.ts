import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AyudaCamaraModalComponent } from '../ayuda-camara-modal/ayuda-camara-modal.component';
import { ModalController } from '@ionic/angular';
import { IonPopover } from '@ionic/angular';
import {  ViewChild } from '@angular/core'; // ← Asegúrate de que incluya ViewChild
import {  AfterViewInit } from '@angular/core';

// ✅ Eliminamos: ViewChild, IonDatetime, PopoverController


@Component({
  selector: 'app-camaras',
  templateUrl: './camaras.page.html',
  styleUrls: ['./camaras.page.scss'],
  standalone: false
})

export class CamarasPage implements OnInit,  AfterViewInit {
  
  @ViewChild('fechaPopover', { static: false }) fechaPopover!: IonPopover;
  // ✅ Eliminamos @ViewChild
  // @ViewChild('datetimePicker', { static: false }) datetimePicker!: IonDatetime;

  // Datos del formulario
  nombre: string = '';
  apellido: string = '';
  rut: string = '';
  telefono: string = '';
  nRegistro: string = '';
  calle: string = '';
  motivo: string = '';

  // Estado de la solicitud
  pendiente: boolean = true;
  resuelto: boolean = false;

  // Fecha y hora seleccionada
  // ✅ Eliminamos displayFechaHora (ya no se usa)
  fechaLocal: string = ''; // ← Guarda directamente el valor ISO

  fechaFormateada: string = ''; // valor legible (para mostrar)
  popoverAbierto = false;


  // Estado de validación por campo
    errores = {
      nombre: false,
      apellido: false,
      rut: false,
      telefono: false,
      nRegistro: false,
      calle: false,
      motivo: false,
      fecha: false
    };


  


  constructor(
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private router: Router,
    private auth: Auth,
    private modalCtrl: ModalController,
    // ✅ Eliminamos PopoverController
    // private popoverCtrl: PopoverController 
  ) {}


  ngAfterViewInit() {
  this.fechaPopover.onDidDismiss().then(() => {
    this.popoverAbierto = false;
  });
}


  ngOnInit() {}

  // ✅ Eliminamos: abrirSelectorFecha, procesarFechaSeleccionada

  // ———————————————————————————————————————
  // 🔒 BLOQUEO DE TECLAS - SOLO TEXTO (nombre, apellido, motivo)
  // ———————————————————————————————————————
  onTextoKeyPress(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End', ' '
    ];

    if (allowedKeys.includes(event.key)) return;

    const char = event.key;
    // Permitir solo letras (incluyendo tildes y ñ en teclados internacionales)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(char)) {
      event.preventDefault();
    }
  }

  // ———————————————————————————————————————
  // 🔒 BLOQUEO DE TECLAS - SOLO NÚMEROS (teléfono, nRegistro)
  // ———————————————————————————————————————
  onNumeroKeyPress(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) return;

    // Permitir solo dígitos
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  // ———————————————————————————————————————
  // 🔒 BLOQUEO DE TECLAS - DIRECCIÓN (letras, números, # . - y espacios)
  // ———————————————————————————————————————
  onDireccionKeyPress(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End', ' '
    ];

    if (allowedKeys.includes(event.key)) return;

    const char = event.key;
    // Permitir letras, números, #, ., -
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#.-]$/.test(char)) {
      event.preventDefault();
    }
  }

  // ——————————————————————————————————————————————————————————————
  // ✅ AYUDA MODAL
  // ——————————————————————————————————————————————————————————————
  async mostrarAyuda() {
    const modal = await this.modalCtrl.create({
      component: AyudaCamaraModalComponent,
      cssClass: 'custom-modal'
    });
    await modal.present();
  }

  // ——————————————————————————————————————————————————————————————
  // ✅ VALIDACIÓN DE TEXTO: Nombre, Apellido, Motivo
  // ——————————————————————————————————————————————————————————————
  validarTexto(event: any, campo: string) {
    const valor = event.target.value;
    // Solo letras, tildes, ñ, espacios
    const soloLetras = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    switch (campo) {
      case 'nombre': this.nombre = soloLetras.substring(0, 50); break;
      case 'apellido': this.apellido = soloLetras.substring(0, 50); break;
      case 'motivo': this.motivo = soloLetras.substring(0, 200); break;
    }
  }

  // ——————————————————————————————————————————————————————————————
  // ✅ VALIDACIÓN DEL RUT (sin cambios, solo comentarios claros)
  // ——————————————————————————————————————————————————————————————
  onRutKeyPress(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;

    const char = event.key.toUpperCase();
    const input = event.target as HTMLInputElement;
    const currentValue = input.value.replace(/\./g, '').replace(/-/g, '');
    const hasK = currentValue.includes('K');

    // Permitir dígitos (máx 8 antes del dígito verificador)
    if (/[0-9]/.test(char)) {
      if (currentValue.length >= 9) event.preventDefault();
      return;
    }

    // Permitir 'K' solo al final, tras 7-8 dígitos y sin K previa
    if (char === 'K' && !hasK && currentValue.length >= 7 && currentValue.length <= 8) {
      return;
    }

    event.preventDefault();
  }




  formatearRut(event: any) {
      let input = event.target.value;
      // 1. Eliminar puntos y guion, y dejar solo dígitos + K final
      let clean = input.replace(/\./g, '').replace(/-/g, '').toUpperCase();

      // 2. Extraer solo dígitos (máx 8)
      let digits = '';
      for (let char of clean) {
        if (/[0-9]/.test(char) && digits.length < 8) {
          digits += char;
        }
      }

      // 3. Ver si hay una 'K' al final del input original (para DV)
      let hasK = clean.endsWith('K') && digits.length > 0;

      // 4. Formatear cuerpo con puntos
      let cuerpo = digits;
      if (cuerpo.length > 3) {
        cuerpo = cuerpo.replace(/(\d+)(\d{3})(\d{3})$/, (_, a, b, c) => {
          return a ? `${a}.${b}.${c}` : `${b}.${c}`;
        });
      }

      // 5. Armar RUT final
      this.rut = digits
        ? hasK ? `${cuerpo}-K` : `${cuerpo}-`
        : '';

      // 6. Posicionar cursor al final
      setTimeout(() => {
        const el = event.target;
        el.setSelectionRange(this.rut.length, this.rut.length);
      }, 0);
    }

  // ——————————————————————————————————————————————————————————————
  // ✅ VALIDACIÓN DE TELÉFONO (máx 8 dígitos, con puntos: 9123.4567)
  // ——————————————————————————————————————————————————————————————
  formatearTelefono(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    this.telefono = value.replace(/(\d{4})(\d+)/, '$1.$2');
  }

  // ——————————————————————————————————————————————————————————————
  // ✅ VALIDACIÓN DE NÚMERO DE REGISTRO (solo 7 dígitos)
  // ——————————————————————————————————————————————————————————————
  validarNumeroRegistro(event: any) {
    // 1. Obtener el valor actual del input
    const valor = event.target.value;

    // 2. Eliminar TODO lo que no sea dígito (0-9)
    const soloNumeros = valor.replace(/[^0-9]/g, '');

    // 3. Limitar a máximo 7 dígitos (puede ser menos)
    this.nRegistro = soloNumeros.substring(0, 7);
  }

  // ——————————————————————————————————————————————————————————————
  // ✅ VALIDACIÓN DE DIRECCIÓN (letras, números, espacios, # . -)
  // ——————————————————————————————————————————————————————————————
  validarDireccion(event: any) {
    const valor = event.target.value;
    const permitido = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.#-]/g, '');
    this.calle = permitido.substring(0, 100);
  }

  // ——————————————————————————————————————————————————————————————
  // ✅ VALIDACIÓN GLOBAL ANTES DE ENVIAR
  // ——————————————————————————————————————————————————————————————
  camposValidos(): boolean {
    // Validaciones individuales con límites de longitud
    const nombreValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/.test(this.nombre);
    const apellidoValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/.test(this.apellido);
    const motivoValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,200}$/.test(this.motivo);
    const calleValida = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.#-]{1,100}$/.test(this.calle);
    const nRegistroValido = /^[0-9]{1,7}$/.test(this.nRegistro);
    const telefonoValido = /^([0-9]{8}|[0-9]{4}\.[0-9]{4})$/.test(this.telefono);


    // ✅ Validación de fecha: debe existir (no vacía)
    const fechaValida = this.fechaLocal.trim() !== '';

    // Validación RUT
    const rutLimpio = this.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    const rutValido = /^[0-9]{7,8}[0-9K]$/.test(rutLimpio) && rutLimpio.length >= 8 && /^[0-9K]+$/.test(rutLimpio);

    return (
      nombreValido &&
      apellidoValido &&
      rutValido &&
      telefonoValido &&
      nRegistroValido &&
      calleValida &&
      motivoValido &&
      fechaValida // ✅ Usamos fechaLocal
    );
  }

  // ——————————————————————————————————————————————————————————————
  // ✅ ENVÍO DE SOLICITUD
  // ——————————————————————————————————————————————————————————————
  async guardarSolicitud() {
      const usuario = await this.auth.currentUser;
      if (!usuario) return;

      // Reiniciar errores
      this.errores = {
        nombre: false,
        apellido: false,
        rut: false,
        telefono: false,
        nRegistro: false,
        calle: false,
        motivo: false,
        fecha: false
      };

      // Validar cada campo individualmente
      const nombreValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/.test(this.nombre);
      const apellidoValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/.test(this.apellido);
      const motivoValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,200}$/.test(this.motivo);
      const calleValida = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.#-]{1,100}$/.test(this.calle);
      const nRegistroValido = /^[0-9]{1,7}$/.test(this.nRegistro);
      const telefonoValido = /^([0-9]{8}|[0-9]{4}\.[0-9]{4})$/.test(this.telefono);
      const rutLimpio = this.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
      const rutValido = /^[0-9]{7,8}[0-9K]$/.test(rutLimpio) && /^[0-9K]+$/.test(rutLimpio);
      const fechaValida = this.fechaLocal.trim() !== '';

      // Marcar errores y borrar campos inválidos
      if (!nombreValido) { this.errores.nombre = true; this.nombre = ''; }
      if (!apellidoValido) { this.errores.apellido = true; this.apellido = ''; }
      if (!rutValido) { this.errores.rut = true; this.rut = ''; }
      if (!telefonoValido) { this.errores.telefono = true; this.telefono = ''; }
      if (!nRegistroValido) { this.errores.nRegistro = true; this.nRegistro = ''; }
      if (!calleValida) { this.errores.calle = true; this.calle = ''; }
      if (!motivoValido) { this.errores.motivo = true; this.motivo = ''; }
      if (!fechaValida) { this.errores.fecha = true; this.fechaLocal = ''; this.fechaFormateada = ''; }

      // Si hay algún error, mostrar alerta
      if (Object.values(this.errores).some(error => error)) {
        const alert = await this.alertCtrl.create({
          header: 'Datos inválidos',
          message: 'Algunos campos no cumplen con el formato requerido. Los campos incorrectos se han borrado.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

      // ✅ Si todo es válido, guardar
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
          fecha: this.fechaLocal,
          usuarioUID: usuario.uid,
          estado: { pendiente: this.pendiente, resuelto: this.resuelto },
        });

        const alert = await this.alertCtrl.create({
          header: 'Solicitud enviada',
          message: 'La solicitud de grabación fue registrada correctamente.',
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


  // Abre el popover de fecha
    abrirDatetimePopover(event: any) {
      this.fechaPopover.event = event;
      this.fechaPopover.present();
    }

    // Maneja el cambio de fecha
    onFechaChange(event: any) {
        const iso = event.detail.value;
        if (iso) {
          this.fechaLocal = iso;
          const date = new Date(iso);
          const opciones: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          };
          this.fechaFormateada = date.toLocaleString('es-ES', opciones).replace('.', '');
        } else {
          this.fechaLocal = '';
          this.fechaFormateada = '';
        }
        this.fechaPopover.dismiss();
      }



}