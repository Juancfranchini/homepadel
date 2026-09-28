'use client';

import { useId, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { DiaEmbudo } from './useMarketingStats';

/**
 * Un gráfico chico por paso del embudo, cada uno con su propia escala.
 * Antes iban las cinco líneas en un mismo eje: las vistas de página (cientos)
 * aplastaban al carrito, el checkout y las compras (decenas o cero) contra el
 * piso, y con pocos días la "evolución" era una diagonal sin información.
 */

type CampoDia = Exclude<keyof DiaEmbudo, 'date'>;

const SERIES: { key: CampoDia; label: string }[] = [
  { key: 'pageView', label: 'Vistas de página' },
  { key: 'viewContent', label: 'Vistas de producto' },
  { key: 'addToCart', label: 'Agregados al carrito' },
  { key: 'initiateCheckout', label: 'Inicios de checkout' },
  { key: 'purchase', label: 'Compras' },
];

const COLOR = '#65a30d'; // lime-600: 3,1:1 sobre blanco
const COLOR_PARCIAL_FONDO = '#ecfccb'; // lime-100, con rayado del COLOR encima
const GRILLA = '#e5e7eb';
const TEXTO_EJE = '#6b7280';
const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';

/** Días que no están completos: hoy (en curso) y el primero (arrancó a media jornada). */
export interface DiasParciales {
  hoy: string;
  inicio: { fecha: string; hora: string } | null;
}

interface Props {
  rows: DiaEmbudo[];
  parciales: DiasParciales;
  /** Cuántos días pidió el filtro; puede ser más que `rows` si el seguimiento es más nuevo. */
  diasPedidos: number;
}

const fmt = (n: number) => n.toLocaleString('es-AR');
const diaCorto = (fecha: string) => fecha.slice(8, 10) + '/' + fecha.slice(5, 7);

/** "Lunes 28/09". */
function diaLargo(fecha: string) {
  const semana = new Date(fecha + 'T12:00:00-03:00').toLocaleDateString('es-AR', { timeZone: ZONA_ARGENTINA, weekday: 'long' });
  return semana.charAt(0).toUpperCase() + semana.slice(1) + ' ' + diaCorto(fecha);
}

function notaParcial(fecha: string, parciales: DiasParciales): string | null {
  if (fecha === parciales.hoy) return 'hoy, en curso';
  if (parciales.inicio && fecha === parciales.inicio.fecha) return 'desde las ' + parciales.inicio.hora + ' hs';
  return null;
}

export default function DailyCharts({ rows, parciales, diasPedidos }: Props) {
  const [verTabla, setVerTabla] = useState(false);
  const [trafico, ...embudo] = SERIES;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900">Evolución diaria</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {rows.length < diasPedidos
              ? `Se muestran ${rows.length} de los ${diasPedidos} días: antes no había seguimiento.`
              : `Últimos ${diasPedidos} días.`}{' '}
            Cada gráfico tiene su propia escala.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVerTabla(!verTabla)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          {verTabla ? 'Ver gráficos' : 'Ver tabla'}
        </button>
      </div>

      {verTabla ? (
        <TablaDiaria rows={rows} parciales={parciales} />
      ) : (
        <>
          <Panel serie={trafico} rows={rows} parciales={parciales} alto="h-52" />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {embudo.map((serie) => (
              <Panel key={serie.key} serie={serie} rows={rows} parciales={parciales} alto="h-40" />
            ))}
          </div>
          <Referencias parciales={parciales} rows={rows} />
        </>
      )}
    </section>
  );
}

function Panel({ serie, rows, parciales, alto }: { serie: (typeof SERIES)[number]; rows: DiaEmbudo[]; parciales: DiasParciales; alto: string }) {
  const patronId = 'rayado-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const total = rows.reduce((suma, row) => suma + row[serie.key], 0);

  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700">{serie.label}</h3>
        <span className="text-xs text-gray-500">{fmt(total)} en total</span>
      </div>
      {total === 0 ? (
        <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400 md:h-40">
          Sin registros en este período
        </div>
      ) : (
        <div className={alto}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="20%">
              <defs>
                <pattern id={patronId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill={COLOR_PARCIAL_FONDO} />
                  <line x1="0" y1="0" x2="0" y2="6" stroke={COLOR} strokeWidth="2.5" />
                </pattern>
              </defs>
              <CartesianGrid vertical={false} stroke={GRILLA} />
              <XAxis
                dataKey="date"
                tickFormatter={(fecha: string) => (fecha === parciales.hoy ? 'Hoy' : diaCorto(fecha))}
                tick={{ fontSize: 11, fill: TEXTO_EJE }}
                tickLine={false}
                axisLine={{ stroke: GRILLA }}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis
                allowDecimals={false}
                tickFormatter={fmt}
                tick={{ fontSize: 11, fill: TEXTO_EJE }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickCount={5}
              />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                content={(props: TooltipProps<number, string>) => (
                  <DiaTooltip {...props} etiqueta={serie.label} parciales={parciales} />
                )}
              />
              <Bar dataKey={serie.key} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {rows.map((row) => (
                  <Cell key={row.date} fill={notaParcial(row.date, parciales) ? `url(#${patronId})` : COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function DiaTooltip({ active, payload, etiqueta, parciales }: TooltipProps<number, string> & { etiqueta: string; parciales: DiasParciales }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as DiaEmbudo;
  const nota = notaParcial(row.date, parciales);
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="text-gray-500">
        {diaLargo(row.date)}
        {nota && <span className="text-gray-400"> · {nota}</span>}
      </p>
      <p className="mt-1">
        <strong className="text-base text-gray-900">{fmt(Number(payload[0].value ?? 0))}</strong>{' '}
        <span className="text-gray-600">{etiqueta.toLowerCase()}</span>
      </p>
    </div>
  );
}

function Referencias({ parciales, rows }: { parciales: DiasParciales; rows: DiaEmbudo[] }) {
  const notas = rows.flatMap((row) => {
    const nota = notaParcial(row.date, parciales);
    return nota ? [diaCorto(row.date) + ' ' + nota] : [];
  });
  if (notas.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
      {notas.length < rows.length && (
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: COLOR }} /> Día completo
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ background: `repeating-linear-gradient(45deg, ${COLOR} 0 2px, ${COLOR_PARCIAL_FONDO} 2px 4px)` }}
        />
        Día incompleto ({notas.join(' · ')}): no se compara con un día entero
      </span>
    </div>
  );
}

function TablaDiaria({ rows, parciales }: { rows: DiaEmbudo[]; parciales: DiasParciales }) {
  const filas = [...rows].reverse();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="py-2 pr-4 font-semibold">Día</th>
            {SERIES.map((serie) => (
              <th key={serie.key} className="py-2 pl-4 text-right font-semibold">{serie.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {filas.map((row) => {
            const nota = notaParcial(row.date, parciales);
            return (
              <tr key={row.date} className="border-b border-gray-100 last:border-0">
                <td className="py-2 pr-4 text-gray-700">
                  {diaLargo(row.date)}
                  {nota && <span className="ml-1 text-xs text-gray-400">({nota})</span>}
                </td>
                {SERIES.map((serie) => (
                  <td key={serie.key} className="py-2 pl-4 text-right text-gray-900">{fmt(row[serie.key])}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
