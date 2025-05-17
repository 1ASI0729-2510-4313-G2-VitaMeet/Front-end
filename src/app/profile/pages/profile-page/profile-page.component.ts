import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-profile-page',
  imports: [
    MatCardModule
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
  standalone: true
})
export class ProfilePageComponent {
  longText = `have flu.`;
}
