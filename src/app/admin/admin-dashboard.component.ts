import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TarifasService, Tarifa, TarifaCategoria } from '../core/services/tarifas.service';
import { supabase } from '../core/supabase.client';

type FiltroCategoria = 'todas' | TarifaCategoria;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  tarifas: Tarifa[] = [];
  filtro: FiltroCategoria = 'todas';
  loading = false;
  saving = false;
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

  constructor(
    private readonly fb: FormBuilder,
    private readonly tarifasService: TarifasService,
    private readonly router: Router
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

  async ngOnInit(): Promise<void> {
    const { data } = await supabase.auth.getUser();
    this.userEmail = data.user?.email ?? '';
    await this.loadTarifas();
  }

  async loadTarifas(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.tarifas = await this.tarifasService.getTarifasAdmin(this.filtro === 'todas' ? undefined : this.filtro);
    } catch {
      this.error = 'No se pudieron cargar las tarifas. Inténtalo de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  async setFiltro(filtro: FiltroCategoria): Promise<void> {
    this.filtro = filtro;
    await this.loadTarifas();
  }

  async toggleActivo(tarifa: Tarifa, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    try {
      const updated = await this.tarifasService.toggleActivo(tarifa.id, target.checked);
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
    this.isModalOpen = false;
    this.editingTarifa = null;
  }

  async saveTarifa(): Promise<void> {
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
        await this.tarifasService.updateTarifa(this.editingTarifa.id, payload);
        this.message = 'Tarifa actualizada correctamente.';
      } else {
        await this.tarifasService.createTarifa(payload);
        this.message = 'Tarifa creada correctamente.';
      }

      this.closeModal();
      await this.loadTarifas();
    } catch {
      this.message = 'No se pudo guardar la tarifa.';
    } finally {
      this.saving = false;
    }
  }

  async deleteTarifa(tarifa: Tarifa): Promise<void> {
    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${tarifa.nombre}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await this.tarifasService.deleteTarifa(tarifa.id);
      this.message = 'Tarifa eliminada.';
      await this.loadTarifas();
    } catch {
      this.message = 'No se pudo eliminar la tarifa.';
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    await this.router.navigate(['/admin/login']);
  }
}
