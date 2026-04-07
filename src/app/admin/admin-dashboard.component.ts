import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TarifasService, Tarifa, TarifaCategoria } from '../core/services/tarifas.service';
import { FaqsService, Faq } from '../core/services/faqs.service';
import { BlogService, BlogPost, BlogContentBlock, BlogContentBlockType } from '../core/services/blog.service';
import {
  EventsService,
  CbmEvent,
  EventCategory,
  EventPricingType,
  EventStatus,
  EventRegistration,
  RegistrationStatus
} from '../core/services/events.service';
import { supabase } from '../core/supabase.client';
import { BonosRegaloService, BonoEstado, BonoRegalo } from '../core/services/bonos-regalo.service';
import { ConfiguracionService } from '../core/services/configuracion.service';

type FiltroCategoria = 'todas' | TarifaCategoria;
type Seccion = 'tarifas' | 'faqs' | 'blog' | 'clases' | 'bonos' | 'checkin';
type FiltroEventos = 'todos' | 'proximos' | 'gratis' | 'pago' | 'destacados' | 'completados';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

  // ── Blog ──────────────────────────────────────────────────────────────────
  blogPosts: BlogPost[] = [];
  blogLoading = false;
  blogSaving = false;
  blogDeletingId: string | null = null;
  blogError = '';
  blogMessage = '';

  isBlogModalOpen = false;
  editingPost: BlogPost | null = null;
  blogBlocks: BlogContentBlock[] = [];

  readonly blogForm;

  readonly blockTypeLabels: Record<BlogContentBlockType, string> = {
    subtitulo: 'Subtítulo',
    parrafo: 'Párrafo',
    lista: 'Lista',
    cta: 'CTA'
  };

  readonly categoriasSugeridas = ['Dolor lumbar', 'Dolor cervical', 'Técnicas utilizadas', 'Pilates', 'Lesiones deportivas'];

  // ── Clases / Eventos ──────────────────────────────────────────────────────
  eventos: CbmEvent[] = [];
  eventosLoading = false;
  eventosSaving = false;
  eventosDeletingId: string | null = null;
  eventosError = '';
  eventosMessage = '';
  filtroEventos: FiltroEventos = 'todos';

  isEventoModalOpen = false;
  editingEvento: CbmEvent | null = null;

  isRegistrosModalOpen = false;
  eventoRegistros: EventRegistration[] = [];
  registrosLoading = false;
  eventoRegistrosTitle = '';
  updatingRegistrationId: string | null = null;
  registrosMessage = '';

  // ── Check-in ──────────────────────────────────────────────────────────────
  checkinCode = '';
  checkinLoading = false;
  checkinUpdating = false;
  checkinError = '';
  checkinResult: (EventRegistration & {
    events: { title: string; start_at: string; location: string | null } | null
  }) | null = null;

  // ── Bonos regalo ─────────────────────────────────────────────────────────
  bonos: BonoRegalo[] = [];
  bonosLoading = false;
  bonosError = '';
  bonosMessage = '';
  bonosActivosWeb = false;
  filtroBonos: 'todos' | BonoEstado = 'todos';
  isBonoModalOpen = false;
  bonoDetalle: BonoRegalo | null = null;
  codigoManual = '';

  readonly bonosEstados: BonoEstado[] = ['pendiente_pago', 'pagado', 'enviado', 'canjeado'];

  readonly registroStatusLabels: Record<string, string> = {
    confirmed: 'Confirmado',
    rejected:  'Rechazado',
    cancelled: 'Cancelado'
  };

  readonly eventosFiltroTabs: { value: FiltroEventos; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'proximos', label: 'Próximos' },
    { value: 'gratis', label: 'Gratis' },
    { value: 'pago', label: 'De pago' },
    { value: 'destacados', label: 'Destacados' },
    { value: 'completados', label: 'Completados' }
  ];

  readonly eventoCategoryLabels: Record<EventCategory, string> = {
    pilates: 'Pilates',
    fisioterapia: 'Fisioterapia',
    taller: 'Taller',
    evento_especial: 'Evento especial',
    otro: 'Otro'
  };

  readonly eventoStatusLabels: Record<EventStatus, string> = {
    active: 'Activo',
    completed: 'Completo',
    cancelled: 'Cancelado',
    inactive: 'Inactivo'
  };
  readonly ctaSuggestionsFree = ['Quiero probar', 'Reservar mi plaza', 'Quiero empezar'];
  readonly ctaSuggestionsPaid = ['Reservar sesión', 'Agendar cita'];

  readonly eventoForm;

  private readonly requestTimeoutMs = 12000;

  constructor(
    private readonly fb: FormBuilder,
    private readonly tarifasService: TarifasService,
    private readonly faqsService: FaqsService,
    private readonly blogService: BlogService,
    private readonly eventsService: EventsService,
    private readonly bonosRegaloService: BonosRegaloService,
    private readonly configuracionService: ConfiguracionService,
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

    this.blogForm = this.fb.nonNullable.group({
      titulo: ['', Validators.required],
      categoria: ['', Validators.required],
      resumen: ['', Validators.required],
      destacado: [false],
      activo: [true],
      orden: [0, Validators.required],
      slug: ['']
    });

    this.eventoForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
      slug: [''],
      short_description: ['', Validators.required],
      long_description: [''],
      category: ['pilates' as EventCategory, Validators.required],
      pricing_type: ['free' as EventPricingType, Validators.required],
      price: [null as number | null],
      currency: ['EUR'],
      start_at: ['', Validators.required],
      end_at: [''],
      duration_minutes: [null as number | null],
      total_slots: [10, [Validators.required, Validators.min(1)]],
      image_url: [''],
      location: [''],
      cta_label: [''],
      highlight_on_home: [false],
      is_active: [true],
      is_visible: [true],
      is_new_clients_only: [false],
      free_limit_per_person: [1, Validators.min(1)],
      free_cooldown_days: [30, Validators.min(0)],
      status: ['active' as EventStatus]
    });
  }

  // ── Getters ───────────────────────────────────────────────────────────────

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
    // Solo muestra el overlay de carga global la primera vez (cuando no hay datos aún
    // y no hay error). Una vez que los datos llegaron o falló, nunca más.
    return this.loading && !this.tarifas.length && !this.error;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    const { data } = await supabase.auth.getUser();
    this.userEmail = data.user?.email ?? '';
    await Promise.all([this.loadTarifas(), this.loadFaqs(), this.loadBlogPosts(), this.loadEventos(), this.loadBonos(), this.loadBonosConfig()]);
  }

  setSeccion(seccion: Seccion): void {
    this.seccion = seccion;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), this.requestTimeoutMs))
    ]);
  }

  private flushUiState(): void {
    this.zone.run(() => {
      this.cdr.detectChanges();
    });
  }

  /**
   * Muestra un mensaje de feedback en la sección indicada y lo borra
   * automáticamente después de `ttl` ms para que no quede pegado para siempre.
   */
  private showMsg(
    section: 'tarifas' | 'faqs' | 'blog' | 'eventos' | 'registros',
    text: string,
    ttl = 4000
  ): void {
    switch (section) {
      case 'tarifas':   this.message = text; break;
      case 'faqs':      this.faqMessage = text; break;
      case 'blog':      this.blogMessage = text; break;
      case 'eventos':   this.eventosMessage = text; break;
      case 'registros': this.registrosMessage = text; break;
    }
    this.flushUiState();
    setTimeout(() => {
      this.zone.run(() => {
        if (section === 'tarifas'   && this.message === text)         this.message = '';
        if (section === 'faqs'      && this.faqMessage === text)      this.faqMessage = '';
        if (section === 'blog'      && this.blogMessage === text)     this.blogMessage = '';
        if (section === 'eventos'   && this.eventosMessage === text)  this.eventosMessage = '';
        if (section === 'registros' && this.registrosMessage === text) this.registrosMessage = '';
        this.flushUiState();
      });
    }, ttl);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ── Tarifas ───────────────────────────────────────────────────────────────

  private sortTarifas(tarifas: Tarifa[]): Tarifa[] {
    return [...tarifas].sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }

      return a.orden - b.orden;
    });
  }

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
    } finally {
      this.flushUiState();
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
      this.showMsg('tarifas', 'Tarifa eliminada.');
    } catch {
      this.tarifas = previous;
      this.showMsg('tarifas', 'No se pudo eliminar la tarifa.');
    } finally {
      this.zone.run(() => {
        this.deletingId = null;
        this.flushUiState();
      });
    }
  }

  // ── FAQs ──────────────────────────────────────────────────────────────────

  async loadFaqs(): Promise<void> {
    this.faqLoading = true;
    this.faqError = '';

    try {
      const data = await this.withTimeout(this.faqsService.getAllFaqs());
      this.faqs = [...data].sort((a, b) => a.orden - b.orden);
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
    } finally {
      this.flushUiState();
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
        this.faqs = [...this.faqs.map((item) => (item.id === updated.id ? updated : item))].sort((a, b) => a.orden - b.orden);
        this.faqMessage = 'Pregunta actualizada correctamente.';
      } else {
        const created = await this.withTimeout(this.faqsService.createFaq(payload));
        this.faqs = [...[created, ...this.faqs]].sort((a, b) => a.orden - b.orden);
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
      this.showMsg('faqs', 'Pregunta eliminada.');
    } catch {
      this.faqs = previous;
      this.showMsg('faqs', 'No se pudo eliminar la pregunta.');
    } finally {
      this.zone.run(() => {
        this.faqDeletingId = null;
        this.flushUiState();
      });
    }
  }

  // ── Blog ──────────────────────────────────────────────────────────────────

  private sortBlogPosts(posts: BlogPost[]): BlogPost[] {
    return [...posts].sort((a, b) => a.orden - b.orden);
  }

  async loadBlogPosts(): Promise<void> {
    this.blogLoading = true;
    this.blogError = '';

    try {
      const data = await this.withTimeout(this.blogService.getAllPosts());
      this.blogPosts = this.sortBlogPosts(data);
    } catch {
      this.blogError = 'No se pudieron cargar los posts. Recarga la página e inténtalo de nuevo.';
    } finally {
      this.blogLoading = false;
    }
  }

  async toggleBlogActivo(post: BlogPost, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    try {
      const updated = await this.withTimeout(this.blogService.toggleActivo(post.id, target.checked));
      this.blogPosts = this.blogPosts.map((p) => (p.id === updated.id ? updated : p));
      this.blogMessage = 'Estado actualizado correctamente.';
    } catch {
      target.checked = post.activo;
      this.blogMessage = 'Error al actualizar el estado.';
    } finally {
      this.flushUiState();
    }
  }

  async toggleBlogDestacado(post: BlogPost, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      const current = this.blogPosts.find((p) => p.destacado && p.id !== post.id);
      if (current) {
        try {
          await this.withTimeout(this.blogService.toggleDestacado(current.id, false));
          this.blogPosts = this.blogPosts.map((p) => (p.id === current.id ? { ...p, destacado: false } : p));
        } catch {
          target.checked = false;
          this.blogMessage = 'Error al actualizar el destacado.';
          return;
        }
      }
    }

    try {
      const updated = await this.withTimeout(this.blogService.toggleDestacado(post.id, target.checked));
      this.blogPosts = this.blogPosts.map((p) => (p.id === updated.id ? updated : p));
      this.blogMessage = 'Destacado actualizado.';
    } catch {
      target.checked = post.destacado;
      this.blogMessage = 'Error al actualizar el destacado.';
    } finally {
      this.flushUiState();
    }
  }

  openBlogCreateModal(): void {
    this.editingPost = null;
    this.blogBlocks = [];
    this.blogForm.reset({ titulo: '', categoria: '', resumen: '', destacado: false, activo: true, orden: 0, slug: '' });
    this.blogMessage = '';
    this.isBlogModalOpen = true;
  }

  openBlogEditModal(post: BlogPost): void {
    this.editingPost = post;
    this.blogBlocks = JSON.parse(JSON.stringify(post.contenido)) as BlogContentBlock[];
    this.blogForm.reset({
      titulo: post.titulo,
      categoria: post.categoria,
      resumen: post.resumen,
      destacado: post.destacado,
      activo: post.activo,
      orden: post.orden,
      slug: post.slug ?? ''
    });
    this.blogMessage = '';
    this.isBlogModalOpen = true;
  }

  closeBlogModal(): void {
    if (this.blogSaving) {
      return;
    }

    this.isBlogModalOpen = false;
    this.editingPost = null;
    this.blogBlocks = [];
  }

  // ── Block editor ──────────────────────────────────────────────────────────

  addBlogBlock(tipo: BlogContentBlockType): void {
    const block: BlogContentBlock = tipo === 'lista' ? { tipo, items: [''] } : { tipo, texto: '' };
    this.blogBlocks = [...this.blogBlocks, block];
  }

  removeBlogBlock(index: number): void {
    this.blogBlocks = this.blogBlocks.filter((_, i) => i !== index);
  }

  moveBlogBlockUp(index: number): void {
    if (index === 0) {
      return;
    }

    const blocks = [...this.blogBlocks];
    [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    this.blogBlocks = blocks;
  }

  moveBlogBlockDown(index: number): void {
    if (index === this.blogBlocks.length - 1) {
      return;
    }

    const blocks = [...this.blogBlocks];
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    this.blogBlocks = blocks;
  }

  updateBlogBlockText(index: number, value: string): void {
    // Mutación en sitio para no resetear el cursor del textarea
    this.blogBlocks[index].texto = value;
  }

  addListItem(blockIndex: number): void {
    const block = this.blogBlocks[blockIndex];
    if (!block.items) {
      block.items = [];
    }

    block.items = [...block.items, ''];
    // Forzar detección de cambio en la referencia del bloque
    this.blogBlocks = [...this.blogBlocks];
  }

  updateListItem(blockIndex: number, itemIndex: number, value: string): void {
    const block = this.blogBlocks[blockIndex];
    if (block.items) {
      block.items[itemIndex] = value;
    }
  }

  removeListItem(blockIndex: number, itemIndex: number): void {
    const block = this.blogBlocks[blockIndex];
    if (block.items && block.items.length > 1) {
      block.items = block.items.filter((_, j) => j !== itemIndex);
      this.blogBlocks = [...this.blogBlocks];
    }
  }

  private generateSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  autoFillSlug(): void {
    const titulo = this.blogForm.controls.titulo.value;
    if (titulo) {
      this.blogForm.controls.slug.setValue(this.generateSlug(titulo));
    }
  }

  async saveBlogPost(): Promise<void> {
    if (this.blogSaving) {
      return;
    }

    this.blogMessage = '';

    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    this.blogSaving = true;
    const formValue = this.blogForm.getRawValue();
    const payload = {
      ...formValue,
      slug: formValue.slug.trim() || null,
      contenido: this.blogBlocks
    };

    try {
      if (payload.destacado) {
        const current = this.blogPosts.find((p) => p.destacado && p.id !== this.editingPost?.id);
        if (current) {
          await this.withTimeout(this.blogService.toggleDestacado(current.id, false));
          this.blogPosts = this.blogPosts.map((p) => (p.id === current.id ? { ...p, destacado: false } : p));
        }
      }

      if (this.editingPost) {
        const updated = await this.withTimeout(this.blogService.updatePost(this.editingPost.id, payload));
        this.blogPosts = this.sortBlogPosts(this.blogPosts.map((p) => (p.id === updated.id ? updated : p)));
        this.blogMessage = 'Post actualizado correctamente.';
      } else {
        const created = await this.withTimeout(this.blogService.createPost(payload));
        this.blogPosts = this.sortBlogPosts([created, ...this.blogPosts]);
        this.blogMessage = 'Post creado correctamente.';
      }

      this.isBlogModalOpen = false;
      this.editingPost = null;
      this.blogBlocks = [];
      this.blogForm.reset({ titulo: '', categoria: '', resumen: '', destacado: false, activo: true, orden: 0, slug: '' });
      this.flushUiState();
    } catch {
      this.blogMessage = 'No se pudo guardar el post.';
      this.flushUiState();
    } finally {
      this.zone.run(() => {
        this.blogSaving = false;
        this.flushUiState();
      });
    }
  }

  async deleteBlogPost(post: BlogPost): Promise<void> {
    if (this.blogDeletingId) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${post.titulo}"?`);
    if (!confirmed) {
      return;
    }

    this.blogDeletingId = post.id;
    const previous = [...this.blogPosts];
    this.blogPosts = this.blogPosts.filter((p) => p.id !== post.id);

    try {
      await this.withTimeout(this.blogService.deletePost(post.id));
      this.showMsg('blog', 'Post eliminado.');
    } catch {
      this.blogPosts = previous;
      this.showMsg('blog', 'No se pudo eliminar el post.');
    } finally {
      this.zone.run(() => {
        this.blogDeletingId = null;
        this.flushUiState();
      });
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    await this.router.navigate(['/admin/login']);
  }

  // ── Clases / Eventos ──────────────────────────────────────────────────────

  get eventosFiltrados(): CbmEvent[] {
    const now = new Date().toISOString();
    switch (this.filtroEventos) {
      case 'proximos': return this.eventos.filter((e) => e.start_at >= now);
      case 'gratis': return this.eventos.filter((e) => e.pricing_type === 'free');
      case 'pago': return this.eventos.filter((e) => e.pricing_type === 'paid');
      case 'destacados': return this.eventos.filter((e) => e.highlight_on_home);
      case 'completados': return this.eventos.filter((e) => e.status === 'completed');
      default: return this.eventos;
    }
  }

  get isEventoPaidSelected(): boolean {
    return this.eventoForm.controls.pricing_type.value === 'paid';
  }

  get isEventoFreeSelected(): boolean {
    return this.eventoForm.controls.pricing_type.value === 'free';
  }

  get eventoCtaSuggestions(): string[] {
    return this.isEventoFreeSelected ? this.ctaSuggestionsFree : this.ctaSuggestionsPaid;
  }

  setFiltroEventos(filtro: FiltroEventos): void {
    this.filtroEventos = filtro;
  }

  async loadEventos(): Promise<void> {
    this.eventosLoading = true;
    this.eventosError = '';

    try {
      this.eventos = await this.withTimeout(this.eventsService.getEventsAdmin());
    } catch {
      this.eventosError = 'No se pudieron cargar los eventos. Recarga la página e inténtalo de nuevo.';
    } finally {
      this.eventosLoading = false;
    }
  }

  async toggleEventoActivo(evento: CbmEvent, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    try {
      const updated = await this.withTimeout(this.eventsService.toggleActive(evento.id, target.checked));
      this.eventos = this.eventos.map((e) => (e.id === updated.id ? updated : e));
      this.eventosMessage = 'Estado actualizado correctamente.';
    } catch {
      target.checked = evento.is_active;
      this.eventosMessage = 'Error al actualizar el estado.';
    } finally {
      this.flushUiState();
    }
  }

  async saveEvento_toggleHome(evento: CbmEvent, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    try {
      const updated = await this.withTimeout(
        this.eventsService.updateEvent(evento.id, { highlight_on_home: target.checked })
      );
      this.eventos = this.eventos.map((e) => (e.id === updated.id ? updated : e));
      this.eventosMessage = 'Destacado en home actualizado.';
    } catch {
      target.checked = evento.highlight_on_home;
      this.eventosMessage = 'Error al actualizar el destacado.';
    } finally {
      this.flushUiState();
    }
  }

  openEventoCreateModal(): void {
    this.editingEvento = null;
    this.eventoForm.reset({
      title: '', slug: '', short_description: '', long_description: '',
      category: 'pilates', pricing_type: 'free', price: null, currency: 'EUR',
      start_at: '', end_at: '', duration_minutes: null, total_slots: 10,
      image_url: '', location: '', cta_label: '', highlight_on_home: false,
      is_active: true, is_visible: true, is_new_clients_only: false,
      free_limit_per_person: 1, free_cooldown_days: 30, status: 'active'
    });
    this.eventosMessage = '';
    this.isEventoModalOpen = true;
  }

  openEventoEditModal(evento: CbmEvent): void {
    this.editingEvento = evento;
    this.eventoForm.reset({
      title: evento.title,
      slug: evento.slug ?? '',
      short_description: evento.short_description,
      long_description: evento.long_description ?? '',
      category: evento.category,
      pricing_type: evento.pricing_type,
      price: evento.price,
      currency: evento.currency,
      start_at: evento.start_at ? this.toLocalDatetimeInput(evento.start_at) : '',
      end_at: evento.end_at ? this.toLocalDatetimeInput(evento.end_at) : '',
      duration_minutes: evento.duration_minutes,
      total_slots: evento.total_slots,
      image_url: evento.image_url ?? '',
      location: evento.location ?? '',
      cta_label: evento.cta_label ?? '',
      highlight_on_home: evento.highlight_on_home,
      is_active: evento.is_active,
      is_visible: evento.is_visible,
      is_new_clients_only: evento.is_new_clients_only,
      free_limit_per_person: evento.free_limit_per_person,
      free_cooldown_days: evento.free_cooldown_days,
      status: evento.status
    });
    this.eventosMessage = '';
    this.isEventoModalOpen = true;
  }

  closeEventoModal(): void {
    if (this.eventosSaving) return;
    this.isEventoModalOpen = false;
    this.editingEvento = null;
  }

  async saveEvento(): Promise<void> {
    if (this.eventosSaving) return;

    this.eventosMessage = '';

    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      return;
    }

    this.eventosSaving = true;
    const v = this.eventoForm.getRawValue();

    const payload = {
      title: v.title.trim(),
      slug: v.slug.trim() || null,
      short_description: v.short_description.trim(),
      long_description: v.long_description.trim() || null,
      category: v.category,
      pricing_type: v.pricing_type,
      price: v.pricing_type === 'paid' ? (v.price ?? null) : null,
      currency: v.currency || 'EUR',
      start_at: v.start_at ? new Date(v.start_at).toISOString() : '',
      end_at: v.end_at ? new Date(v.end_at).toISOString() : null,
      duration_minutes: v.duration_minutes ?? null,
      total_slots: v.total_slots,
      image_url: v.image_url.trim() || null,
      location: v.location.trim() || null,
      cta_label: v.cta_label.trim() || null,
      highlight_on_home: v.highlight_on_home,
      is_active: v.is_active,
      is_visible: v.is_visible,
      is_new_clients_only: v.is_new_clients_only,
      free_limit_per_person: v.pricing_type === 'free' ? v.free_limit_per_person : 1,
      free_cooldown_days: v.pricing_type === 'free' ? v.free_cooldown_days : 30,
      status: v.status
    };

    try {
      if (this.editingEvento) {
        const updated = await this.withTimeout(this.eventsService.updateEvent(this.editingEvento.id, payload));
        this.eventos = this.eventos.map((e) => (e.id === updated.id ? updated : e));
        this.eventosMessage = 'Evento actualizado correctamente.';
      } else {
        const created = await this.withTimeout(
          this.eventsService.createEvent(payload as Parameters<typeof this.eventsService.createEvent>[0])
        );
        this.eventos = [created, ...this.eventos];
        this.eventosMessage = 'Evento creado correctamente.';
      }

      this.isEventoModalOpen = false;
      this.editingEvento = null;
      this.flushUiState();
    } catch {
      this.eventosMessage = 'No se pudo guardar el evento.';
      this.flushUiState();
    } finally {
      this.zone.run(() => {
        this.eventosSaving = false;
        this.flushUiState();
      });
    }
  }

  async duplicateEvento(evento: CbmEvent): Promise<void> {
    if (this.eventosDeletingId || this.eventosSaving) return;

    this.eventosSaving = true;
    this.eventosMessage = '';

    try {
      const copy = await this.withTimeout(this.eventsService.duplicateEvent(evento));
      this.eventos = [copy, ...this.eventos];
      this.showMsg('eventos', 'Evento duplicado. Ahora puedes editarlo.');
    } catch {
      this.showMsg('eventos', 'No se pudo duplicar el evento.');
    } finally {
      this.zone.run(() => {
        this.eventosSaving = false;
        this.flushUiState();
      });
    }
  }

  async deleteEvento(evento: CbmEvent): Promise<void> {
    if (this.eventosDeletingId) return;

    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${evento.title}"?\nEsta acción también eliminará todas las inscripciones asociadas.`);
    if (!confirmed) return;

    this.eventosDeletingId = evento.id;
    const previous = [...this.eventos];
    this.eventos = this.eventos.filter((e) => e.id !== evento.id);

    try {
      await this.withTimeout(this.eventsService.deleteEvent(evento.id));
      this.showMsg('eventos', 'Evento eliminado.');
    } catch {
      this.eventos = previous;
      this.showMsg('eventos', 'No se pudo eliminar el evento.');
    } finally {
      this.zone.run(() => {
        this.eventosDeletingId = null;
        this.flushUiState();
      });
    }
  }

  async openRegistrosModal(evento: CbmEvent): Promise<void> {
    this.eventoRegistrosTitle = evento.title;
    this.isRegistrosModalOpen = true;
    this.registrosLoading = true;
    this.eventoRegistros = [];

    try {
      this.eventoRegistros = await this.withTimeout(
        this.eventsService.getRegistrationsByEvent(evento.id)
      );
    } catch {
      this.eventosMessage = 'No se pudieron cargar las inscripciones.';
    } finally {
      this.registrosLoading = false;
      this.flushUiState();
    }
  }

  closeRegistrosModal(): void {
    this.isRegistrosModalOpen = false;
    this.eventoRegistros = [];
    this.registrosMessage = '';
    this.updatingRegistrationId = null;
  }

  async updateRegistroStatus(reg: EventRegistration, newStatus: RegistrationStatus): Promise<void> {
    if (this.updatingRegistrationId) return;

    this.updatingRegistrationId = reg.id;
    this.registrosMessage = '';
    const previousStatus = reg.status;

    // Actualización optimista
    this.eventoRegistros = this.eventoRegistros.map((r) =>
      r.id === reg.id ? { ...r, status: newStatus as EventRegistration['status'] } : r
    );

    try {
      await this.withTimeout(
        this.eventsService.updateRegistrationStatus(reg.id, newStatus as EventRegistration['status'])
      );
      this.registrosMessage = `Estado actualizado a "${this.registroStatusLabels[newStatus]}".`;
    } catch {
      // Rollback
      this.eventoRegistros = this.eventoRegistros.map((r) =>
        r.id === reg.id ? { ...r, status: previousStatus } : r
      );
      this.registrosMessage = 'No se pudo actualizar el estado. Inténtalo de nuevo.';
    } finally {
      this.updatingRegistrationId = null;
      this.flushUiState();
    }
  }

  async checkInRegistro(reg: EventRegistration): Promise<void> {
    if (this.updatingRegistrationId) return;

    this.updatingRegistrationId = reg.id;
    this.registrosMessage = '';

    // Optimistic update
    this.eventoRegistros = this.eventoRegistros.map((r) =>
      r.id === reg.id ? { ...r, checked_in_at: new Date().toISOString() } : r
    );

    try {
      await this.withTimeout(this.eventsService.checkInRegistration(reg.id));
      this.registrosMessage = `Check-in registrado para ${reg.full_name}.`;
    } catch {
      // Rollback
      this.eventoRegistros = this.eventoRegistros.map((r) =>
        r.id === reg.id ? { ...r, checked_in_at: null } : r
      );
      this.registrosMessage = 'No se pudo registrar el check-in. Inténtalo de nuevo.';
    } finally {
      this.updatingRegistrationId = null;
      this.flushUiState();
    }
  }

  async searchCheckin(): Promise<void> {
    if (!this.checkinCode.trim()) return;
    this.checkinLoading = true;
    this.checkinError = '';
    this.checkinResult = null;

    try {
      const result = await this.withTimeout(
        this.eventsService.findRegistrationByCode(this.checkinCode)
      );
      if (!result) {
        this.checkinError = 'No hemos encontrado ninguna inscripción con ese código.';
      } else {
        this.checkinResult = result;
      }
    } catch {
      this.checkinError = 'Error al buscar. Inténtalo de nuevo.';
    } finally {
      this.zone.run(() => { this.checkinLoading = false; this.flushUiState(); });
    }
  }

  async doCheckin(): Promise<void> {
    if (!this.checkinResult) return;
    this.checkinUpdating = true;

    try {
      await this.withTimeout(this.eventsService.checkInRegistration(this.checkinResult.id));
      this.checkinResult = { ...this.checkinResult, checked_in_at: new Date().toISOString() };
    } catch {
      this.checkinError = 'No se pudo registrar la asistencia. Inténtalo de nuevo.';
    } finally {
      this.zone.run(() => { this.checkinUpdating = false; this.flushUiState(); });
    }
  }

  resetCheckin(): void {
    this.checkinCode = '';
    this.checkinResult = null;
    this.checkinError = '';
  }



  get bonosFiltrados(): BonoRegalo[] {
    if (this.filtroBonos === 'todos') {
      return this.bonos;
    }

    return this.bonos.filter((bono) => bono.estado === this.filtroBonos);
  }

  get bonosStats(): { total: number; pendientes: number; pagados: number; canjeados: number } {
    return {
      total: this.bonos.length,
      pendientes: this.bonos.filter((b) => b.estado === 'pendiente_pago').length,
      pagados: this.bonos.filter((b) => b.estado === 'pagado').length,
      canjeados: this.bonos.filter((b) => b.estado === 'canjeado').length
    };
  }

  estadoBonoLabel(estado: BonoEstado): string {
    const map: Record<BonoEstado, string> = {
      pendiente_pago: 'Pendiente pago',
      pagado: 'Pagado',
      enviado: 'Enviado',
      canjeado: 'Canjeado'
    };

    return map[estado];
  }

  async loadBonosConfig(): Promise<void> {
    try {
      this.bonosActivosWeb = await this.configuracionService.isBonosRegaloActivo();
    } catch {
      this.bonosActivosWeb = false;
    }
  }

  async toggleBonosActivos(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const valor = target.checked;

    try {
      await this.withTimeout(this.configuracionService.updateConfiguracion('bonos_regalo_activo', valor ? 'true' : 'false'));
      this.bonosActivosWeb = valor;
      this.showMsg('eventos', 'Configuración de bonos actualizada.');
    } catch {
      target.checked = !valor;
      this.bonosMessage = 'No se pudo actualizar la configuración.';
    }
  }

  async loadBonos(): Promise<void> {
    this.bonosLoading = true;
    this.bonosError = '';

    try {
      this.bonos = await this.withTimeout(this.bonosRegaloService.getAllBonos());
    } catch {
      this.bonosError = 'No se pudieron cargar los bonos regalo.';
    } finally {
      this.bonosLoading = false;
    }
  }

  async updateBonoEstado(bono: BonoRegalo, event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const estado = target.value as BonoEstado;

    try {
      const updated = await this.withTimeout(this.bonosRegaloService.updateEstado(bono.id, estado));
      this.bonos = this.bonos.map((item) => item.id === updated.id ? updated : item);
      this.bonosMessage = 'Estado del bono actualizado.';
    } catch {
      target.value = bono.estado;
      this.bonosMessage = 'No se pudo actualizar el estado del bono.';
    }
  }

  openBonoDetalle(bono: BonoRegalo): void {
    this.bonoDetalle = bono;
    this.isBonoModalOpen = true;
  }

  closeBonoDetalle(): void {
    this.isBonoModalOpen = false;
    this.bonoDetalle = null;
  }

  async deleteBono(bono: BonoRegalo): Promise<void> {
    if (!window.confirm(`¿Eliminar bono ${bono.codigo}?`)) return;

    const previous = [...this.bonos];
    this.bonos = this.bonos.filter((item) => item.id !== bono.id);

    try {
      await this.withTimeout(this.bonosRegaloService.deleteBono(bono.id));
      this.bonosMessage = 'Bono eliminado.';
    } catch {
      this.bonos = previous;
      this.bonosMessage = 'No se pudo eliminar el bono.';
    }
  }

  generarCodigoBono(): void {
    const code = this.bonosRegaloService.generarCodigo();
    this.codigoManual = code;
    navigator.clipboard?.writeText(code);
    this.bonosMessage = 'Código generado y copiado al portapapeles.';
  }

  getEventoAvailableSlots(evento: CbmEvent): number {
    return this.eventsService.getAvailableSlots(evento);
  }

  /**
   * Convierte un ISO UTC string al formato requerido por <input type="datetime-local">
   * (hora local del navegador, sin offset). Sin esto, editar un evento desplaza
   * la hora ±N horas por cada edición según el timezone del admin.
   */
  private toLocalDatetimeInput(isoUtc: string): string {
    const d = new Date(isoUtc);
    if (isNaN(d.getTime())) return '';
    // Restar el offset del timezone local para obtener la hora local como si fuera UTC
    const offsetMs = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - offsetMs).toISOString().substring(0, 16);
  }

  generateEventoSlug(): void {
    const title = this.eventoForm.controls.title.value;
    if (title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      this.eventoForm.controls.slug.setValue(slug);
    }
  }
}
