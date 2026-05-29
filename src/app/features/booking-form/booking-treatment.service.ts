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

  setSelectedTreatment(treatment: SelectedTreatment | null): void {
    this.selectedTreatmentSubject.next(treatment);
  }

  getSelectedTreatment(): SelectedTreatment | null {
    return this.selectedTreatmentSubject.value;
  }

  clearSelectedTreatment(): void {
    this.selectedTreatmentSubject.next(null);
  }
}

