import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Output() editarPerfil = new EventEmitter<void>();
  @Output() cerrarSesion = new EventEmitter<void>();

  onEditarPerfil() {
    this.editarPerfil.emit();
  }

  onCerrarSesion() {
    this.cerrarSesion.emit();
  }
}
