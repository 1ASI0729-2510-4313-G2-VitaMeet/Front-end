import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigService } from './shared/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend-vitameet';

  constructor(private config: ConfigService) {}

  ngOnInit() {
    // Debug de URLs para verificar configuración
    this.config.debugUrls();
    
    // Test de todos los endpoints
    setTimeout(() => {
      this.config.testAllEndpoints();
    }, 1000);
  }
}
