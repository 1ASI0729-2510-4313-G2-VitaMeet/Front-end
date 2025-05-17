import { Component } from '@angular/core';
import { EvaluationComponent } from './evaluation/evaluation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EvaluationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend-vitameet';
}
