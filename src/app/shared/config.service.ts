import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  /**
   * Obtiene la URL base para las APIs según la configuración
   */
  getApiBaseUrl(): string {
    return environment.useBackend ? environment.backendUrl : environment.apiUrl;
  }

  /**
   * Indica si se está usando el backend real o JSON Server
   */
  isUsingBackend(): boolean {
    return environment.useBackend;
  }

  /**
   * Obtiene la URL completa para un endpoint específico
   */
  getEndpointUrl(endpoint: string): string {
    const baseUrl = this.getApiBaseUrl();
    
    // Si usa backend real y la baseUrl ya incluye /api, no duplicar
    if (this.isUsingBackend()) {
      // Si el endpoint comienza con /api/ y la baseUrl ya incluye /api, quitar /api del endpoint
      if (endpoint.startsWith('/api/') && baseUrl.includes('/api')) {
        endpoint = endpoint.replace('/api/', '/');
      }
      // Si el endpoint no comienza con / agregarlo
      if (!endpoint.startsWith('/')) {
        endpoint = '/' + endpoint;
      }
    }
    
    // Si usa JSON Server, quitar /api del endpoint si lo tiene
    if (!this.isUsingBackend() && endpoint.startsWith('/api/')) {
      endpoint = endpoint.replace('/api/', '/');
    }
    
    return `${baseUrl}${endpoint}`;
  }

  /**
   * URLs específicas para diferentes servicios
   */
  getAuthUrl(): string {
    return this.isUsingBackend() 
      ? this.getEndpointUrl('/auth')
      : this.getEndpointUrl('/register'); // JSON Server usa /register
  }

  getAuthLoginUrl(): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl('/auth/login')
      : this.getEndpointUrl('/register'); // JSON Server usa /register para validar
  }

  getAuthRegisterUrl(): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl('/auth/register')
      : this.getEndpointUrl('/register'); // JSON Server usa /register
  }

  getPatientsUrl(): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl('/v1/patients')  // Backend usa /api/v1/patients
      : this.getEndpointUrl('/patients');
  }

  getDoctorsUrl(): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl('/v1/doctors')  // Backend usa /api/v1/doctors  
      : this.getEndpointUrl('/doctors');
  }

  getAppointmentsUrl(): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl('/appointments')  // Backend usa /api/appointments
      : this.getEndpointUrl('/appointments');
  }

  // Métodos alternativos para endpoints de citas si el principal no funciona
  getAlternativeAppointmentsUrls(): string[] {
    if (this.isUsingBackend()) {
      return [
        this.getEndpointUrl('/v1/appointments'),  // Fallback original
        this.getEndpointUrl('/citas'),
        this.getEndpointUrl('/appointment')
      ];
    } else {
      return [this.getEndpointUrl('/appointments')];
    }
  }

  getEvaluationsUrl(): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl('/evaluations')  // Backend usa /api/evaluations
      : this.getEndpointUrl('/evaluations');
  }

  getMedicalRecordsUrl(): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl('/medical-records')  // Backend usa /api/medical-records
      : this.getEndpointUrl('/medicalHistory');
  }

  /**
   * Información de la aplicación
   */
  getAppInfo() {
    return {
      name: environment.appName,
      version: environment.version,
      production: environment.production,
      usingBackend: this.isUsingBackend()
    };
  }

  /**
   * Debug: Mostrar todas las URLs generadas
   */
  debugUrls() {
    console.log('🔍 DEBUG URLs del ConfigService:');
    console.log('📍 Base URL:', this.getApiBaseUrl());
    console.log('🔐 Auth Login:', this.getAuthLoginUrl());
    console.log('📝 Auth Register:', this.getAuthRegisterUrl());
    console.log('👥 Patients:', this.getPatientsUrl());
    console.log('👨‍⚕️ Doctors:', this.getDoctorsUrl());
    console.log('📅 Appointments:', this.getAppointmentsUrl());
    console.log('⭐ Evaluations:', this.getEvaluationsUrl());
    console.log('📋 Medical Records:', this.getMedicalRecordsUrl());
    console.log('🔧 Backend activo:', this.isUsingBackend());
  }

  /**
   * Test simple de endpoint de appointments
   */
  testAppointmentsEndpoint() {
    const url = this.getAppointmentsUrl();
    console.log('🧪 Testing appointments endpoint:', url);
    
    // Hacer una petición de prueba
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      return response.json();
    })
    .then(data => {
      console.log('📊 Data received:', data);
      console.log('📊 Data length:', data?.length || 0);
    })
    .catch(error => {
      console.error('❌ Fetch error:', error);
    });
  }

  /**
   * Test endpoint específico
   */
  testEndpoint(url: string, name: string = 'endpoint') {
    console.log(`🧪 Testing ${name}:`, url);
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`📡 ${name} response status:`, response.status);
      console.log(`📡 ${name} response ok:`, response.ok);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    })
    .then(data => {
      console.log(`📊 ${name} data:`, data);
      console.log(`📊 ${name} length:`, Array.isArray(data) ? data.length : 'Not array');
    })
    .catch(error => {
      console.error(`❌ ${name} error:`, error);
    });
  }

  /**
   * Test todos los endpoints principales
   */
  testAllEndpoints() {
    this.testEndpoint(this.getAppointmentsUrl(), 'Appointments');
    
    // Solo testear patients si no estamos usando backend (ya que backend no soporta GET all patients)
    if (!this.isUsingBackend()) {
      this.testEndpoint(this.getPatientsUrl(), 'Patients');
    } else {
      console.log('⚠️ Skipping Patients list test - backend only supports GET /api/v1/patients/{id}');
    }
    
    this.testEndpoint(this.getDoctorsUrl(), 'Doctors');
    this.testEndpoint(this.getEvaluationsUrl(), 'Evaluations');
  }

  /**
   * Indica si el endpoint de listar todos los pacientes está disponible
   */
  isPatientsListSupported(): boolean {
    return !this.isUsingBackend(); // Solo JSON Server soporta GET all patients
  }

  /**
   * URL para obtener un paciente específico por ID
   */
  getPatientByIdUrl(id: number): string {
    return this.isUsingBackend()
      ? this.getEndpointUrl(`/v1/patients/${id}`)  // Backend soporta GET /api/v1/patients/{id}
      : this.getEndpointUrl(`/patients/${id}`);    // JSON Server soporta GET /patients/{id}
  }

}
