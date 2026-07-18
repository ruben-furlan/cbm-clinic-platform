import { describe, expect, it } from 'vitest';
import { interpretarComandoCartel } from './cartel-voz';

describe('interpretarComandoCartel', () => {
  it('entiende "volvemos en 20" con dígitos', () => {
    const r = interpretarComandoCartel('volvemos en 20');
    expect(r?.estado).toBe('volvemos');
    expect(r?.minutos).toBe(20);
    expect(r?.titulo).toBe('Volvemos en 20 minutos');
  });

  it('entiende los minutos dichos con palabras', () => {
    const r = interpretarComandoCartel('vuelvo en cinco minutos');
    expect(r?.estado).toBe('volvemos');
    expect(r?.minutos).toBe(5);
  });

  it('entiende "media hora" y "un cuarto de hora"', () => {
    expect(interpretarComandoCartel('volvemos en media hora')?.minutos).toBe(30);
    expect(interpretarComandoCartel('vuelvo en un cuarto de hora')?.minutos).toBe(15);
  });

  it('usa 5 minutos por defecto si no dicen cuántos', () => {
    const r = interpretarComandoCartel('ahora volvemos');
    expect(r?.estado).toBe('volvemos');
    expect(r?.minutos).toBe(5);
    expect(r?.titulo).toBe('Volvemos en 5 minutos');
  });

  it('usa singular para un minuto', () => {
    expect(interpretarComandoCartel('vuelvo en 1 minuto')?.titulo).toBe('Volvemos en 1 minuto');
  });

  it('entiende cerrado, con y sin acentos', () => {
    expect(interpretarComandoCartel('cerrado por hoy')?.estado).toBe('cerrado');
    expect(interpretarComandoCartel('ya cerramos hasta mañana')?.estado).toBe('cerrado');
  });

  it('entiende abierto', () => {
    expect(interpretarComandoCartel('estamos abiertos')?.estado).toBe('abierto');
    expect(interpretarComandoCartel('abrimos')?.estado).toBe('abierto');
  });

  it('entiende el timbre', () => {
    expect(interpretarComandoCartel('toca el timbre')?.estado).toBe('timbre');
  });

  it('el timbre gana aunque la frase mencione estar dentro atendiendo', () => {
    expect(interpretarComandoCartel('pon que toquen el timbre que estamos dentro')?.estado).toBe(
      'timbre',
    );
  });

  it('devuelve null cuando no entiende la frase', () => {
    expect(interpretarComandoCartel('hola buenos días')).toBeNull();
    expect(interpretarComandoCartel('')).toBeNull();
    expect(interpretarComandoCartel('   ')).toBeNull();
  });

  it('ignora minutos absurdos y cae al valor por defecto', () => {
    expect(interpretarComandoCartel('volvemos en 900')?.minutos).toBe(5);
  });
});
