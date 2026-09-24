'use client';

import { Save, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useFormatosPaleta } from './useFormatosPaleta';

/** Los mismos que ofrece el formulario de producto. */
const FORMATOS = [
  { clave: 'Diamante', etiqueta: 'Diamante' },
  { clave: 'Lagrima', etiqueta: 'Lágrima' },
  { clave: 'Redondo', etiqueta: 'Redonda' },
];

const inputClass =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

function FilaFormato({ etiqueta, valor, onChange, onSubir, subiendo }: {
  etiqueta: string; valor: string;
  onChange: (v: string) => void; onSubir: () => void; subiendo: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
        <div className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {valor ? (
            <img src={valor} alt="" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-[10px] text-gray-300">sin imagen</span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">{etiqueta}</span>
      </div>

      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="https://... (PNG con fondo transparente)"
      />

      <button type="button" onClick={onSubir} disabled={subiendo}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap flex-shrink-0">
        <Upload className="w-3 h-3" />{subiendo ? 'Subiendo...' : 'Subir imagen'}
      </button>
    </div>
  );
}

/**
 * Imagen por formato de paleta.
 *
 * Se muestra al lado del texto "Formato: ..." en cada tarjeta del catálogo.
 * Antes ahí había íconos genéricos —un rombo, una gota y un círculo— que a ese
 * tamaño no se distinguían entre sí. Con una silueta real se entiende de un
 * vistazo.
 *
 * Es opcional: el formato que no tenga imagen cargada se muestra solo con su
 * nombre, sin dibujo.
 */
export default function FormatosPaletaPage() {
  const { loading, saving, subiendo, valores, fileRef, setValor, pedirArchivo, subirArchivo, guardar } =
    useFormatosPaleta();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/configuracion" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Formatos de paleta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Una imagen por formato, que se muestra al lado del texto en el catálogo. Conviene un PNG
          cuadrado con fondo transparente. Es opcional: el formato sin imagen se muestra solo con su nombre.
        </p>
      </div>

      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={subirArchivo} />

      <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-5 space-y-4">
        {FORMATOS.map((f) => (
          <FilaFormato
            key={f.clave}
            etiqueta={f.etiqueta}
            valor={valores[f.clave] || ''}
            onChange={(v) => setValor(f.clave, v)}
            onSubir={() => pedirArchivo(f.clave)}
            subiendo={subiendo === f.clave}
          />
        ))}
      </div>

      <button type="button" onClick={guardar} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] disabled:opacity-50">
        <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
