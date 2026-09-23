'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCategories, getBrands } from '@/lib/api';
import { Category, Brand } from '@/types';
import MobileNavAccordion from './MobileNavAccordion';

interface Props {
  links: { label: string; href: string }[];
  onNavigate: () => void;
}

const enlaceHoja = 'block py-2.5 text-sm text-[#C7C7C0] transition-colors hover:text-[#B7D31A]';
const enlaceRaiz = 'block py-3 text-sm font-semibold uppercase tracking-wide text-[#C7C7C0] transition-colors hover:text-[#F7F6F7]';

/**
 * Menú de navegación en móvil.
 *
 * "Productos" se despliega en categorías y marcas en lugar de llevar al catálogo
 * completo: buscar una paleta Nox obligaba a entrar al listado de 43 productos y
 * filtrar desde ahí.
 *
 * Las secciones solo aparecen si tienen contenido, así que si la API no responde
 * el menú sigue funcionando como una lista de enlaces.
 */
export default function MobileNav({ links, onNavigate }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brs]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brs) ? brs : []);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="border-t border-[#0D0F0F] bg-[#050606] lg:hidden">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-3">
        {links.map((link) =>
          link.href === '/catalogo' ? (
            <MobileNavAccordion key={link.href} label={link.label}>
              <Link href="/catalogo" className={enlaceHoja} onClick={onNavigate}>
                Ver todo el catálogo
              </Link>

              {categories.length > 0 && (
                <MobileNavAccordion label="Categorías" level={2}>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={'/catalogo?categoria=' + cat.slug}
                      className={enlaceHoja}
                      onClick={onNavigate}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </MobileNavAccordion>
              )}

              {brands.length > 0 && (
                <MobileNavAccordion label="Marcas" level={2}>
                  {brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={'/catalogo?marca=' + brand.slug}
                      className={enlaceHoja}
                      onClick={onNavigate}
                    >
                      {brand.name.trim()}
                    </Link>
                  ))}
                </MobileNavAccordion>
              )}

              <Link href="/catalogo?oferta=true" className={enlaceHoja} onClick={onNavigate}>
                Ofertas
              </Link>
            </MobileNavAccordion>
          ) : (
            <Link key={link.href} href={link.href} className={enlaceRaiz} onClick={onNavigate}>
              {link.label}
            </Link>
          ),
        )}

        <Link href="/cuenta" className={enlaceRaiz} onClick={onNavigate}>
          Mi cuenta
        </Link>
      </div>
    </nav>
  );
}
