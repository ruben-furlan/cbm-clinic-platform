import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SelectedTreatment {
  id: string;
  nombre: string;
  precio: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingTreatmentService {
  private selectedTreatmentSubject = new BehaviorSubject<SelectedTreatment | null>(null);
  public selectedTreatment$ = this.selectedTreatmentSubject.asObservable();

  /** Motivo con el que llega el paciente desde el asistente de orientación. */
  private motivoSubject = new BehaviorSubject<string | null>(null);
  public motivo$ = this.motivoSubject.asObservable();

  setSelectedTreatment(treatment: SelectedTreatment | null): void {
    this.selectedTreatmentSubject.next(treatment);
  }

  getSelectedTreatment(): SelectedTreatment | null {
    return this.selectedTreatmentSubject.value;
  }

  clearSelectedTreatment(): void {
    this.selectedTreatmentSubject.next(null);
  }

  setMotivo(motivo: string | null): void {
    this.motivoSubject.next(motivo);
  }

  getMotivo(): string | null {
    return this.motivoSubject.value;
  }
}

