import { Injectable } from '@angular/core';

interface CreatePaymentIntentResponse {
  clientSecret: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class StripePaymentService {
  async createPaymentIntent(tratamiento: string): Promise<string> {
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tratamiento }),
    });
    const data = (await response.json()) as CreatePaymentIntentResponse;
    if (!response.ok || !data.clientSecret) {
      throw new Error(data.error ?? 'No se pudo inicializar el pago');
    }
    return data.clientSecret;
  }
}
