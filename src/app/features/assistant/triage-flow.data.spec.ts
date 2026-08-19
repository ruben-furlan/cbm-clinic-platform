import { describe, expect, it } from 'vitest';
import { SEO_PAGES } from '../seo-pages/seo-content.data';
import { TRIAGE_NODES, TRIAGE_OUTCOMES, TRIAGE_ROOT_ID } from './triage-flow.data';

const allOptions = Object.values(TRIAGE_NODES).flatMap((node) =>
  node.opciones.map((option) => ({ node, option })),
);

describe('grafo de triaje', () => {
  it('tiene un nodo raíz', () => {
    expect(TRIAGE_NODES[TRIAGE_ROOT_ID]).toBeDefined();
  });

  it('cada opción apunta a un nodo o a un resultado que existe', () => {
    for (const { node, option } of allOptions) {
      const destino =
        option.next.kind === 'node'
          ? TRIAGE_NODES[option.next.nodeId]
          : TRIAGE_OUTCOMES[option.next.outcomeId];

      expect(destino, `${node.id} → ${option.id}`).toBeDefined();
    }
  });

  it('todos los nodos son alcanzables desde la raíz', () => {
    const visitados = new Set<string>([TRIAGE_ROOT_ID]);
    const pendientes = [TRIAGE_ROOT_ID];

    while (pendientes.length > 0) {
      const actual = TRIAGE_NODES[pendientes.pop() as string];
      for (const option of actual.opciones) {
        if (option.next.kind === 'node' && !visitados.has(option.next.nodeId)) {
          visitados.add(option.next.nodeId);
          pendientes.push(option.next.nodeId);
        }
      }
    }

    expect([...visitados].sort()).toEqual(Object.keys(TRIAGE_NODES).sort());
  });

  it('todos los resultados son alcanzables', () => {
    const alcanzados = new Set(
      allOptions
        .filter(({ option }) => option.next.kind === 'outcome')
        .map(({ option }) => (option.next as { outcomeId: string }).outcomeId),
    );

    expect([...alcanzados].sort()).toEqual(Object.keys(TRIAGE_OUTCOMES).sort());
  });

  it('cada slug SEO referenciado existe en el contenido de las landings', () => {
    for (const outcome of Object.values(TRIAGE_OUTCOMES)) {
      if (outcome.seoSlug) {
        expect(SEO_PAGES[outcome.seoSlug], outcome.id).toBeDefined();
      }
    }
  });

  it('los resultados sin landing traen sus propios pasos y avisos', () => {
    for (const outcome of Object.values(TRIAGE_OUTCOMES)) {
      if (outcome.seoSlug) continue;

      expect(outcome.pasos?.length, `${outcome.id}: pasos`).toBeGreaterThan(0);
      expect(outcome.avisos?.length, `${outcome.id}: avisos`).toBeGreaterThan(0);
    }
  });

  it('ningún resultado promete curación (contenido sanitario prudente)', () => {
    const prohibidas = /\b(cur(a|amos|arás|ación)|garantiz|100%|elimina el dolor)\b/i;

    for (const outcome of Object.values(TRIAGE_OUTCOMES)) {
      const texto = `${outcome.reconocimiento} ${outcome.porQue}`;
      expect(prohibidas.test(texto), `${outcome.id}: "${texto}"`).toBe(false);
    }
  });
});
