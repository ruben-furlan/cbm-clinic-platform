import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'cbm-loader',
  standalone: true,
  templateUrl: './cbm-loader.component.html',
  styleUrls: ['./cbm-loader.component.css']
})
export class CbmLoaderComponent implements OnInit, OnDestroy {
  dotsText = '';
  private dotsInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    let count = 0;
    this.dotsInterval = setInterval(() => {
      count = (count + 1) % 4;
      this.dotsText = '.'.repeat(count);
    }, 400);
  }

  ngOnDestroy(): void {
    if (this.dotsInterval !== null) {
      clearInterval(this.dotsInterval);
      this.dotsInterval = null;
    }
  }
}
