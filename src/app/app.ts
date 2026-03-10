import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/header/header';
import { FooterComponent } from './core/footer/footer';
import { FloatingWhatsappButtonComponent } from './core/floating-whatsapp-button/floating-whatsapp-button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, FooterComponent, FloatingWhatsappButtonComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}
