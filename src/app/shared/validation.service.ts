import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  // Validar email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar contraseña segura
  static validatePassword(password: string): string | null {
    if (!password) {
      return 'La contraseña es requerida';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (password.length > 128) {
      return 'La contraseña no puede exceder 128 caracteres';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    return null;
  }

  // Validar nombre (solo letras y espacios)
  static validateName(name: string): string | null {
    if (!name || name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (name.trim().length > 100) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return null;
  }

  // Validar colegiatura médica (5 dígitos)
  static validateMedicalLicense(license: string): string | null {
    if (!license || !/^\d{5}$/.test(license.trim())) {
      return 'La colegiatura debe tener exactamente 5 dígitos';
    }
    return null;
  }

  // Validar especialidad médica
  static validateSpecialty(specialty: string): string | null {
    if (!specialty || specialty.trim().length < 3) {
      return 'La especialidad debe tener al menos 3 caracteres';
    }
    if (specialty.trim().length > 50) {
      return 'La especialidad no puede exceder 50 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(specialty.trim())) {
      return 'La especialidad solo puede contener letras y espacios';
    }
    return null;
  }

  // Validar años de experiencia
  static validateExperience(experience: number): string | null {
    if (experience < 0 || experience > 50) {
      return 'La experiencia debe estar entre 0 y 50 años';
    }
    return null;
  }

  // Sanitizar texto (remover scripts y contenido peligroso)
  static sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>]/g, '')
      .trim();
  }

  // Validar que una fecha no sea en el pasado
  static validateFutureDate(date: string): string | null {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return 'No se pueden seleccionar fechas pasadas';
    }
    return null;
  }

  // Validar horario laboral
  static validateBusinessHours(time: string): string | null {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 8 || hour >= 18) {
      return 'Las citas solo pueden agendarse entre 8:00 AM y 6:00 PM';
    }
    return null;
  }

  // Validar que no sea domingo
  static validateNotSunday(date: string): string | null {
    const selectedDate = new Date(date);
    if (selectedDate.getDay() === 0) {
      return 'No se pueden agendar citas los domingos';
    }
    return null;
  }

  // Validar longitud de texto
  static validateTextLength(text: string, minLength: number = 0, maxLength: number = 1000): string | null {
    if (text.length < minLength) {
      return `El texto debe tener al menos ${minLength} caracteres`;
    }
    if (text.length > maxLength) {
      return `El texto no puede exceder ${maxLength} caracteres`;
    }
    return null;
  }

  // Detectar contenido inapropiado básico
  static detectInappropriateContent(text: string): boolean {
    const inappropriateWords = [
      'script', 'eval(', 'alert(', 'document.', 'window.',
      'function(', 'return ', 'var ', 'let ', 'const ',
      '<iframe', '<object', '<embed'
    ];
    
    return inappropriateWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
  }

  // Validar rating (1-5)
  static validateRating(rating: number): string | null {
    if (!rating || rating < 1 || rating > 5) {
      return 'La puntuación debe estar entre 1 y 5';
    }
    return null;
  }

  // Generar ID único seguro
  static generateSecureId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
