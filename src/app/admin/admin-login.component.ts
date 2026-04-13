import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../core/supabase.client';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  email = '';
  password = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async login(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';

    if (!environment.supabaseUrl || !environment.supabaseKey || environment.supabaseUrl === 'PLACEHOLDER' || environment.supabaseKey === 'PLACEHOLDER') {
      this.errorMessage = 'Configuración de Supabase incompleta. Revisa environment.ts.';
      return;
    }

    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.errorMessage = 'Introduce email y contraseña.';
      return;
    }

    this.isLoading = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.errorMessage = 'Email o contraseña incorrectos.';
        return;
      }

      if (!data.session) {
        this.errorMessage = 'No se pudo crear la sesión. Inténtalo de nuevo.';
        return;
      }

      await this.router.navigate(['/admin']);
    } catch {
      this.errorMessage = 'Error inesperado al iniciar sesión. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
