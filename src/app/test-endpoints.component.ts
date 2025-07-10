import { Component } from '@angular/core';
import { ConfigService } from './shared/config.service';

@Component({
  selector: 'app-test-endpoints',
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>🔧 Test de Endpoints</h2>
      <div>
        <strong>Backend activo:</strong> {{config.isUsingBackend()}}
      </div>
      <div>
        <strong>Base URL:</strong> {{config.getApiBaseUrl()}}
      </div>
      <br>
      <h3>URLs generadas:</h3>
      <ul>
        <li><strong>Auth Login:</strong> {{config.getAuthLoginUrl()}}</li>
        <li><strong>Auth Register:</strong> {{config.getAuthRegisterUrl()}}</li>
        <li><strong>Patients:</strong> {{config.getPatientsUrl()}}</li>
        <li><strong>Doctors:</strong> {{config.getDoctorsUrl()}}</li>
        <li><strong>Appointments:</strong> {{config.getAppointmentsUrl()}}</li>
        <li><strong>Evaluations:</strong> {{config.getEvaluationsUrl()}}</li>
        <li><strong>Medical Records:</strong> {{config.getMedicalRecordsUrl()}}</li>
      </ul>
    </div>
  `,
  standalone: true
})
export class TestEndpointsComponent {
  constructor(public config: ConfigService) {}
}
