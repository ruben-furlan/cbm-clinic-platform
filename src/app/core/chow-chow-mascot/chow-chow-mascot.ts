import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';

type Spot = 'bottom-left' | 'left-mid' | 'right-top';

interface MiniPuppy {
  id: number;
  tx: string;
  ty: string;
  rot: string;
  delay: string;
  scale: string;
}

const SPOTS: Spot[] = ['bottom-left', 'left-mid', 'right-top'];

const BARKS = ['¡Guau guau!', '¡Wof wof!', '¡Guau!', '¡Wif wif!'];

const MESSAGES = [
  '¡Hoy es un gran día para cuidarte! 🐾',
  'Respira hondo… lo estás haciendo genial ✨',
  'Una sonrisa también es terapia 😊',
  'Tu cuerpo es tu hogar, ¡mímalo! 💛',
  '¡Estirarse un poquito hace magia! 🪄',
  'Paso a paso se llega lejos 🐶',
  '¡Bebe agüita y sigue brillando! 💧',
  'Descansar también es avanzar 🌙',
];

const FIRST_APPEAR_MS = 6000;
const IDLE_HIDE_MS = 15000;
const BARK_MS = 4200;
const REAPPEAR_MIN_MS = 25000;
const REAPPEAR_RANGE_MS = 20000;

@Component({
  selector: 'app-chow-chow-mascot',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './chow-chow-mascot.html',
  styleUrls: ['./chow-chow-mascot.css'],
})
export class ChowChowMascotComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly visible = signal(false);
  readonly barking = signal(false);
  readonly spot = signal<Spot>('bottom-left');
  readonly bark = signal(BARKS[0]);
  readonly message = signal('');
  readonly puppies = signal<MiniPuppy[]>([]);

  private timers: ReturnType<typeof setTimeout>[] = [];
  private puppyId = 0;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.schedule(() => this.appear(), FIRST_APPEAR_MS);
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
  }

  onTap(): void {
    if (this.barking()) return;

    this.bark.set(this.pick(BARKS));
    this.message.set(this.pick(MESSAGES));
    this.puppies.set(this.makePuppies());
    this.barking.set(true);

    this.schedule(() => {
      this.barking.set(false);
      this.puppies.set([]);
      this.disappear();
    }, BARK_MS);
  }

  private appear(): void {
    const candidates = SPOTS.filter((s) => s !== this.spot());
    this.spot.set(this.pick(candidates));
    this.visible.set(true);

    this.schedule(() => {
      if (this.visible() && !this.barking()) {
        this.disappear();
      }
    }, IDLE_HIDE_MS);
  }

  private disappear(): void {
    this.visible.set(false);
    this.schedule(() => this.appear(), REAPPEAR_MIN_MS + Math.random() * REAPPEAR_RANGE_MS);
  }

  private makePuppies(): MiniPuppy[] {
    const count = 8;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const distance = 70 + Math.random() * 70;
      return {
        id: this.puppyId++,
        tx: `${Math.round(Math.cos(angle) * distance)}px`,
        ty: `${Math.round(Math.sin(angle) * distance * 0.8 - 30)}px`,
        rot: `${Math.round(Math.random() * 80 - 40)}deg`,
        delay: `${(Math.random() * 0.25).toFixed(2)}s`,
        scale: (0.3 + Math.random() * 0.25).toFixed(2),
      };
    });
  }

  private pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private schedule(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }
}
