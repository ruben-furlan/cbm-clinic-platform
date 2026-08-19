import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AVISO_DERIVACION, AVISO_NO_DIAGNOSTICO } from './triage-flow.data';
import { TriageResult, TriageService } from './triage.service';

@Component({
  selector: 'app-assistant-result',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './assistant-result.component.html',
  styleUrl: './assistant-result.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantResultComponent {
  private readonly triage = inject(TriageService);

  readonly result = input.required<TriageResult>();

  readonly avisoNoDiagnostico = AVISO_NO_DIAGNOSTICO;
  readonly avisoDerivacion = AVISO_DERIVACION;

  reservar(): void {
    void this.triage.goToBooking();
  }

  cerrar(): void {
    this.triage.close();
  }
}
