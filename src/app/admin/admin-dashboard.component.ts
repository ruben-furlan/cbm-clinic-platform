import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TarifasService, Tarifa, TarifaCategoria } from '../core/services/tarifas.service';
import { FaqsService, Faq } from '../core/services/faqs.service';
import { supabase } from '../core/supabase.client';

type FiltroCategoria = 'todas' | TarifaCategoria;
type Seccion = 'tarifas' | 'faqs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  // ── Sección activa ────────────────────────────────────────────────────────
  seccion: Seccion = 'tarifas';

  // ── Tarifas ───────────────────────────────────────────────────────────────
  tarifas: Tarifa[] = [];
  filtro: FiltroCategoria = 'todas';
  loading = false;
  saving = false;
  deletingId: string | null = null;
  error = '';
  message = '';
  userEmail = '';

  isModalOpen = false;
  editingTarifa: Tarifa | null = null;

  readonly categoriaTabs: { value: FiltroCategoria; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'fisioterapia', label: 'Fisioterapia' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'promocion', label: 'Promociones' }
  ];

  readonly tarifaForm;

  // ── FAQs ──────────────────────────────────────────────────────────────────
  faqs: Faq[] = [];
  faqLoading = false;
  faqSaving = false;
  faqDeletingId: string | null = null;
  faqError = '';
  faqMessage = '';

  isFaqModalOpen = false;
  editingFaq: Faq | null = null;

  readonly faqForm;

  private readonly requestTimeoutMs = 12000;

  constructor(
    private readonly fb: FormBuilder,
    private readonly tarifasService: TarifasService,
    private readonly faqsService: FaqsService,
    private readonly router: Router,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.tarifaForm = this.fb.nonNullable.group({
      categoria: ['fisioterapia' as TarifaCategoria, Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      unidad: ['€' as '€' | '€/mes', Validators.required],
      orden: [0, Validators.required],
      fecha_fin_promo: [''],
      activo: [true]
    });

    this.faqForm = this.fb.nonNullable.group({
      pregunta: ['', Validators.required],
      respuesta: ['', Validators.required],
      orden: [0, Validators.required],
      activo: [true]
    });
  }

  get tarifasFiltradas(): Tarifa[] {
    if (this.filtro === 'todas') {
      return this.tarifas;
    }

    return this.tarifas.filter((tarifa) => tarifa.categoria === this.filtro);
  }

  get isPromoSelected(): boolean {
    return this.tarifaForm.controls.categoria.value === 'promocion';
  }

  get showInitialLoader(): boolean {
    return this.loading && !this.tarifas.length;
  }

  async ngOnInit(): Promise<void> {
    const { data } = await supabase.auth.getUser();
    this.userEmail = data.user?.email ?? '';
    await this.loadTarifas();
    await this.loadFaqs();
  }

  setSeccion(seccion: Seccion): void {
    this.seccion = seccion;
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), this.requestTimeoutMs))
    ]);
  }

  private sortTarifas(tarifas: Tarifa[]): Tarifa[] {
    return [...tarifas].sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.orden - b.orden;
    });
  }

  private sortFaqs(faqs: Faq[]): Faq[] {
    return [...faqs].sort((a, b) => a.orden - b.orden);
  }

  // ── Tarifas ───────────────────────────────────────────────────────────────

  async loadTarifas(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const data = await this.withTimeout(this.tarifasService.getTarifasAdmin());
      this.tarifas = this.sortTarifas(data);
    } catch {
      this.error = 'No se pudieron cargar las tarifas. Recarga la página e inténtalo de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  setFiltro(filtro: FiltroCategoria): void {
    this.filtro = filtro;
  }

  async toggleActivo(tarifa: Tarifa, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    try {
      const updated = await this.withTimeout(this.tarifasService.toggleActivo(tarifa.id, target.checked));
      this.tarifas = this.tarifas.map((item) => (item.id === updated.id ? updated : item));
      this.message = 'Estado actualizado correctamente.';
    } catch {
      target.checked = tarifa.activo;
      this.message = 'Error al actualizar el estado.';
    }
  }

  openCreateModal(): void {
    this.editingTarifa = null;
    this.tarifaForm.reset({
      categoria: 'fisioterapia',
      nombre: '',
      descripcion: '',
      precio: 0,
      unidad: '€',
      orden: 0,
      fecha_fin_promo: '',
      activo: true
    });
    this.message = '';
    this.isModalOpen = true;
  }

  openEditModal(tarifa: Tarifa): void {
    this.editingTarifa = tarifa;
    this.tarifaForm.reset({
      categoria: tarifa.categoria,
      nombre: tarifa.nombre,
      descripcion: tarifa.descripcion ?? '',
      precio: tarifa.precio,
      unidad: tarifa.unidad,
      orden: tarifa.orden,
      fecha_fin_promo: tarifa.fecha_fin_promo ?? '',
      activo: tarifa.activo
    });
    this.message = '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.isModalOpen = false;
    this.editingTarifa = null;
  }

  private flushUiState(): void {
    this.zone.run(() => {
      this.cdr.detectChanges();
    });
  }

  async saveTarifa(): Promise<void> {
    if (this.saving) {
      return;
    }

    this.message = '';

    if (this.tarifaForm.invalid) {
      this.tarifaForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const formValue = this.tarifaForm.getRawValue();
    const payload = {
      ...formValue,
      descripcion: formValue.descripcion.trim() ? formValue.descripcion.trim() : null,
      fecha_fin_promo: formValue.categoria === 'promocion' && formValue.fecha_fin_promo ? formValue.fecha_fin_promo : null
    };

    try {
      if (this.editingTarifa) {
        const updated = await this.withTimeout(this.tarifasService.updateTarifa(this.editingTarifa.id, payload));
        this.tarifas = this.sortTarifas(this.tarifas.map((item) => (item.id === updated.id ? updated : item)));
        this.message = 'Tarifa actualizada correctamente.';
      } else {
        const created = await this.withTimeout(this.tarifasService.createTarifa(payload));
        this.tarifas = this.sortTarifas([created, ...this.tarifas]);
        this.message = 'Tarifa creada correctamente.';
      }

      this.isModalOpen = false;
      this.editingTarifa = null;
      this.tarifaForm.reset({
        categoria: 'fisioterapia',
        nombre: '',
        descripcion: '',
        precio: 0,
        unidad: '€',
        orden: 0,
        fecha_fin_promo: '',
        activo: true
      });
      this.flushUiState();
    } catch {
      this.message = 'No se pudo guardar la tarifa.';
      this.flushUiState();
    } finally {
      this.zone.run(() => {
        this.saving = false;
        this.flushUiState();
      });
    }
  }

  async deleteTarifa(tarifa: Tarifa): Promise<void> {
    if (this.deletingId) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${tarifa.nombre}"?`);
    if (!confirmed) {
      return;
    }

    this.deletingId = tarifa.id;
    const previous = [...this.tarifas];
    this.tarifas = this.tarifas.filter((item) => item.id !== tarifa.id);

    try {
      await this.withTimeout(this.tarifasService.deleteTarifa(tarifa.id));
      this.message = 'Tarifa eliminada.';
    } catch {
      this.tarifas = previous;
      this.message = 'No se pudo eliminar la tarifa.';
    } finally {
      this.deletingId = null;
    }
  }

  // ── FAQs ──────────────────────────────────────────────────────────────────

  async loadFaqs(): Promise<void> {
    this.faqLoading = true;
    this.faqError = '';

    try {
      const data = await this.withTimeout(this.faqsService.getAllFaqs());
      this.faqs = this.sortFaqs(data);
    } catch {
      this.faqError = 'No se pudieron cargar las preguntas frecuentes. Recarga la página e inténtalo de nuevo.';
    } finally {
      this.faqLoading = false;
    }
  }

  async toggleFaqActivo(faq: Faq, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    try {
      const updated = await this.withTimeout(this.faqsService.toggleActivo(faq.id, target.checked));
      this.faqs = this.faqs.map((item) => (item.id === updated.id ? updated : item));
      this.faqMessage = 'Estado actualizado correctamente.';
    } catch {
      target.checked = faq.activo;
      this.faqMessage = 'Error al actualizar el estado.';
    }
  }

  openFaqCreateModal(): void {
    this.editingFaq = null;
    this.faqForm.reset({ pregunta: '', respuesta: '', orden: 0, activo: true });
    this.faqMessage = '';
    this.isFaqModalOpen = true;
  }

  openFaqEditModal(faq: Faq): void {
    this.editingFaq = faq;
    this.faqForm.reset({
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      orden: faq.orden,
      activo: faq.activo
    });
    this.faqMessage = '';
    this.isFaqModalOpen = true;
  }

  closeFaqModal(): void {
    if (this.faqSaving) {
      return;
    }

    this.isFaqModalOpen = false;
    this.editingFaq = null;
  }

  async saveFaq(): Promise<void> {
    if (this.faqSaving) {
      return;
    }

    this.faqMessage = '';

    if (this.faqForm.invalid) {
      this.faqForm.markAllAsTouched();
      return;
    }

    this.faqSaving = true;
    const payload = this.faqForm.getRawValue();

    try {
      if (this.editingFaq) {
        const updated = await this.withTimeout(this.faqsService.updateFaq(this.editingFaq.id, payload));
        this.faqs = this.sortFaqs(this.faqs.map((item) => (item.id === updated.id ? updated : item)));
        this.faqMessage = 'Pregunta actualizada correctamente.';
      } else {
        const created = await this.withTimeout(this.faqsService.createFaq(payload));
        this.faqs = this.sortFaqs([created, ...this.faqs]);
        this.faqMessage = 'Pregunta creada correctamente.';
      }

      this.isFaqModalOpen = false;
      this.editingFaq = null;
      this.faqForm.reset({ pregunta: '', respuesta: '', orden: 0, activo: true });
      this.flushUiState();
    } catch {
      this.faqMessage = 'No se pudo guardar la pregunta.';
      this.flushUiState();
    } finally {
      this.zone.run(() => {
        this.faqSaving = false;
        this.flushUiState();
      });
    }
  }

  async deleteFaq(faq: Faq): Promise<void> {
    if (this.faqDeletingId) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar esta pregunta?\n\n"${faq.pregunta}"`);
    if (!confirmed) {
      return;
    }

    this.faqDeletingId = faq.id;
    const previous = [...this.faqs];
    this.faqs = this.faqs.filter((item) => item.id !== faq.id);

    try {
      await this.withTimeout(this.faqsService.deleteFaq(faq.id));
      this.faqMessage = 'Pregunta eliminada.';
    } catch {
      this.faqs = previous;
      this.faqMessage = 'No se pudo eliminar la pregunta.';
    } finally {
      this.faqDeletingId = null;
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    await this.router.navigate(['/admin/login']);
  }
}
