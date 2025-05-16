import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { RegisterComponent } from '../Register/register.component'; // Importa desde fuera de app/

@NgModule({
    declarations: [

    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppComponent,
        RegisterComponent
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
