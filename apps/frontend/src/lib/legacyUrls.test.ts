import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanHandle,
  parseLegacyPath,
  pickBrandMatch,
  pickProductMatch,
  resolveLegacyDestination,
  searchText,
  type LegacyLookups,
  type ProductCandidate,
} from './legacyUrls.ts';

const nox = { slug: 'nox', name: 'Nox' };
const royal = { slug: 'royal-padel', name: 'Royal Pádel' };

// Muestra del catálogo real: varias versiones de un mismo modelo, que es
// donde una coincidencia floja mandaría al producto equivocado.
const CATALOGO: ProductCandidate[] = [
  { slug: 'nox-at10-luxury-genius-18k-alum-2024', name: 'NOX - AT10 Luxury GENIUS 18K Alum (2024)', brand: nox },
  { slug: 'nox-at10-luxury-genius-18k-alum-2025', name: 'NOX AT10 Luxury GENIUS 18K Alum (2025)', brand: nox },
  { slug: 'nox-at10-luxury-genius-18k-alum-2026', name: 'NOX - AT10 Luxury Genius 18K Alum (2026)', brand: nox },
  { slug: 'royal-m27', name: 'Royal - M27 ', brand: royal },
  { slug: 'royal-m27-light', name: 'Royal - M27 Light', brand: royal },
  { slug: 'technical-veron-25', name: 'Technical Veron 2.5', brand: { slug: 'babolat', name: 'Babolat' } },
];

describe('cleanHandle', () => {
  it('saca el sufijo aleatorio de Tiendanube', () => {
    assert.deepEqual(cleanHandle('paleta-bullpadel-hack-04-2026-9l2i6'), ['paleta', 'bullpadel', 'hack', '04', '2026']);
    assert.deepEqual(cleanHandle('paleta-royal-padel-europe-master-pro-14cg7').at(-1), 'pro');
  });

  it('no confunde con sufijo un año ni una palabra del modelo', () => {
    assert.equal(cleanHandle('paleta-steel-custom-air-tiger-2025').at(-1), '2025');
    assert.equal(cleanHandle('paleta-urich-deep-aconcagua-flextech-3k-con-rojo').at(-1), 'rojo');
    assert.equal(cleanHandle('paleta-nox-vento').at(-1), 'vento');
  });

  it('normaliza mayúsculas y tildes', () => {
    assert.deepEqual(cleanHandle('Paleta-Royal-Pádel-M27'), ['paleta', 'royal', 'padel', 'm27']);
  });
});

describe('parseLegacyPath', () => {
  it('reconoce productos con y sin barra final', () => {
    const esperado = { kind: 'product', words: ['paleta', 'nox', 'at10'] };
    assert.deepEqual(parseLegacyPath('/productos/paleta-nox-at10/'), esperado);
    assert.deepEqual(parseLegacyPath('/productos/paleta-nox-at10'), esperado);
    assert.deepEqual(parseLegacyPath('/PRODUCTOS/Paleta-Nox-AT10/'), esperado);
  });

  it('/productos solo va al catálogo', () => {
    assert.deepEqual(parseLegacyPath('/productos/'), { kind: 'fixed', destination: '/catalogo' });
  });

  it('reconoce categoría y categoría/marca', () => {
    assert.deepEqual(parseLegacyPath('/paletas/'), { kind: 'category', category: 'paletas', brandSegment: null });
    assert.deepEqual(parseLegacyPath('/Paletas/Urich/'), { kind: 'category', category: 'paletas', brandSegment: 'urich' });
  });

  it('deja pasar lo que no es de Tiendanube', () => {
    for (const ruta of ['/', '/catalogo', '/producto/royal-m27', '/paletasx', '/productos/a/b', '/cuenta']) {
      assert.equal(parseLegacyPath(ruta), null, ruta);
    }
  });

  it('no se rompe con un %XX mal formado', () => {
    assert.deepEqual(parseLegacyPath('/productos/paleta-%E0'), { kind: 'product', words: ['paleta', 'e0'] });
  });
});

describe('pickProductMatch', () => {
  it('encuentra el producto cuando las palabras coinciden exacto', () => {
    assert.equal(pickProductMatch(cleanHandle('paleta-nox-at10-luxury-genius-18k-alum-2025-ab1c2'), CATALOGO), 'nox-at10-luxury-genius-18k-alum-2025');
    assert.equal(pickProductMatch(cleanHandle('paleta-royal-padel-m27'), CATALOGO), 'royal-m27');
    assert.equal(pickProductMatch(cleanHandle('paleta-babolat-technical-veron-2-5'), CATALOGO), 'technical-veron-25');
  });

  it('no elige cuando el handle le cabe a varias versiones', () => {
    assert.equal(pickProductMatch(cleanHandle('paleta-nox-at10-luxury-genius-18k-alum'), CATALOGO), null);
  });

  it('no elige un producto al que le falta una palabra del handle', () => {
    // El viejo "AT10 Genius 18K Alum 2025" no decía "Luxury": podría ser otro modelo.
    assert.equal(pickProductMatch(cleanHandle('paleta-nox-at10-genius-18k-alum-2025'), CATALOGO), null);
    assert.equal(pickProductMatch(cleanHandle('paleta-bullpadel-hack-04-2026-9l2i6'), CATALOGO), null);
  });

  it('sin palabras útiles no elige nada', () => {
    assert.equal(pickProductMatch(['paleta', 'de', 'padel'], CATALOGO), null);
  });
});

describe('pickBrandMatch', () => {
  const marcas = [nox, royal, { slug: 'bullpadel', name: 'Bullpadel' }];

  it('acepta el slug nuevo o el nombre viejo de la marca', () => {
    assert.equal(pickBrandMatch('nox', marcas), 'nox');
    assert.equal(pickBrandMatch('royal', marcas), 'royal-padel');
    assert.equal(pickBrandMatch('royal-padel', marcas), 'royal-padel');
  });

  it('una marca que ya no existe da null', () => {
    assert.equal(pickBrandMatch('urich', marcas), null);
  });
});

describe('searchText', () => {
  it('saca relleno y respeta el tope de 6 palabras del backend', () => {
    assert.equal(searchText(cleanHandle('paleta-urich-deep-aconcagua-flextech-3k-con-rojo')), 'urich deep aconcagua flextech 3k rojo');
  });
});

describe('resolveLegacyDestination', () => {
  const lookups = (productos: ProductCandidate[] | Error, marcas: LegacyLookups['brandsOfCategory']): LegacyLookups => ({
    searchProducts: async () => {
      if (productos instanceof Error) throw productos;
      return productos;
    },
    brandsOfCategory: marcas,
  });
  const menu = lookups([], async (c) => (c === 'paletas' ? [nox, royal] : []));

  it('producto encontrado → ficha nueva', async () => {
    const ruta = parseLegacyPath('/productos/paleta-royal-m27/');
    assert.ok(ruta);
    assert.equal(await resolveLegacyDestination(ruta, lookups(CATALOGO, menu.brandsOfCategory)), '/producto/royal-m27');
  });

  it('producto dudoso o API caída → buscador', async () => {
    const ruta = parseLegacyPath('/productos/paleta-bullpadel-hack-04-2026-9l2i6/');
    assert.ok(ruta);
    const esperado = '/catalogo?q=bullpadel+hack+04+2026';
    assert.equal(await resolveLegacyDestination(ruta, lookups(CATALOGO, menu.brandsOfCategory)), esperado);
    assert.equal(await resolveLegacyDestination(ruta, lookups(new Error('caída'), menu.brandsOfCategory)), esperado);
  });

  it('categoría/marca solo conserva la marca si existe en esa categoría', async () => {
    const con = (p: string) => resolveLegacyDestination(parseLegacyPath(p)!, menu);
    assert.equal(await con('/paletas/'), '/catalogo?categoria=paletas');
    assert.equal(await con('/paletas/royal/'), '/catalogo?categoria=paletas&marca=royal-padel');
    assert.equal(await con('/paletas/urich/'), '/catalogo?categoria=paletas');
    assert.equal(await con('/zapatillas/nox'), '/catalogo?categoria=zapatillas');
  });

  it('si el menú falla, la categoría sale sin marca', async () => {
    const caido = lookups([], async () => {
      throw new Error('caída');
    });
    assert.equal(await resolveLegacyDestination(parseLegacyPath('/paletas/nox/')!, caido), '/catalogo?categoria=paletas');
  });
});
