import { armarFeedCsv, campoCsv, disponibilidad, filaDelFeed, ProductoParaFeed } from './catalog-feed.csv';

const SITIO = 'https://www.homepadel.com.ar';

function producto(cambios: Partial<ProductoParaFeed> = {}): ProductoParaFeed {
  return {
    id: 'cmu-1',
    name: 'NOX AT10 Genius 18K',
    slug: 'nox-at10-genius-18k',
    description: '<p>Paleta de <b>potencia</b>,\ncarbono 18K.</p>',
    price: 650000,
    salePrice: 545000,
    stock: 2,
    isMadeToOrder: false,
    images: ['https://res.cloudinary.com/x/a.jpg', 'https://res.cloudinary.com/x/b.jpg'],
    brand: { name: 'Nox' },
    category: { name: 'Paletas' },
    variants: [],
    ...cambios,
  };
}

describe('feed de productos para Meta', () => {
  it('usa el mismo id que los eventos y los campos que exige Meta', () => {
    const fila = filaDelFeed(producto(), SITIO, '');
    expect(fila).toEqual([
      'cmu-1',
      'NOX AT10 Genius 18K',
      'Paleta de potencia , carbono 18K.',
      'in stock',
      'new',
      '650000.00 ARS',
      '545000.00 ARS',
      'https://www.homepadel.com.ar/producto/nox-at10-genius-18k',
      'https://res.cloudinary.com/x/a.jpg',
      'https://res.cloudinary.com/x/b.jpg',
      'Nox',
      'Paletas',
    ]);
  });

  it('sin oferta real (igual o mayor al precio) no manda sale_price', () => {
    expect(filaDelFeed(producto({ salePrice: 650000 }), SITIO, '')?.[6]).toBe('');
    expect(filaDelFeed(producto({ salePrice: null }), SITIO, '')?.[6]).toBe('');
  });

  it('sin imagen o sin precio queda afuera: Meta lo rechazaría', () => {
    expect(filaDelFeed(producto({ images: [] }), SITIO, '')).toBeNull();
    expect(filaDelFeed(producto({ price: 0 }), SITIO, '')).toBeNull();
  });

  it('sin descripción usa el nombre y la marca', () => {
    expect(filaDelFeed(producto({ description: null }), SITIO, '')?.[2]).toBe('NOX AT10 Genius 18K — Nox');
  });

  it('una imagen guardada como ruta se vuelve absoluta con la dirección del backend', () => {
    expect(filaDelFeed(producto({ images: ['/uploads/a.jpg'] }), SITIO, 'https://api.ejemplo.com')?.[8]).toBe('https://api.ejemplo.com/uploads/a.jpg');
  });

  it('disponibilidad: a pedido, con stock, sin stock y con variantes', () => {
    expect(disponibilidad(producto({ isMadeToOrder: true, stock: 0 }))).toBe('available for order');
    expect(disponibilidad(producto({ stock: 0 }))).toBe('out of stock');
    const conTalles = { stock: 0, variants: [{ stock: 0, active: true, isDefault: true }, { stock: 3, active: true, isDefault: false }] };
    expect(disponibilidad(producto(conTalles))).toBe('in stock');
    const talleInactivo = { stock: 5, variants: [{ stock: 4, active: false, isDefault: false }, { stock: 0, active: true, isDefault: false }] };
    expect(disponibilidad(producto(talleInactivo))).toBe('out of stock');
  });

  it('escapa comas y comillas como pide el CSV', () => {
    expect(campoCsv('Paleta "Pro", 2026')).toBe('"Paleta ""Pro"", 2026"');
    expect(campoCsv('simple')).toBe('simple');
  });

  it('arma el archivo con encabezado y salta los productos incompletos', () => {
    const csv = armarFeedCsv([producto(), producto({ id: 'sin-foto', images: [] })], SITIO, '');
    const lineas = csv.trim().split('\n');
    expect(lineas[0]).toBe('id,title,description,availability,condition,price,sale_price,link,image_link,additional_image_link,brand,product_type');
    expect(lineas).toHaveLength(2);
    expect(csv).not.toContain('sin-foto');
  });
});
