import {
  Zap, Crosshair, Scale, CircleDot, Weight, Gauge, Activity, Wind, Waves, Hand,
  Diamond, Triangle, Circle, Ruler, Layers, Grid3x3, Feather, Sparkles,
  TrendingUp, Swords, User, Shield, Award, Star, Target, Package, Thermometer,
  Droplets, Maximize, Scissors, Footprints,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Iconos de las especificaciones de un producto.
 *
 * Las etiquetas están escritas en términos de pádel —balance, punto dulce,
 * salida de bola, núcleo— y no en el nombre del dibujo, que era lo que se
 * ofrecía antes: "Objetivo", "Gotas", "Tijeras", "Huellas". Elegir el icono de
 * una especificación de paleta a partir de esos nombres era adivinar.
 *
 * IMPORTANTE: esta lista está duplicada en la tienda, en
 * `app/producto/[slug]/components/specIcons.ts`. Las dos apps se instalan y
 * despliegan por separado y no comparten código, así que si se agrega un icono
 * hay que agregarlo en las dos. Si solo se agrega en el backoffice, la tienda
 * lo dibuja con el icono por defecto.
 *
 * Los valores existentes no se quitan nunca aunque cambien de etiqueta: son los
 * que están guardados en los productos ya cargados.
 */
export interface SpecIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const SPEC_ICONS: SpecIconOption[] = [
  // Lo que define el juego de una paleta
  { value: 'Zap',        label: 'Potencia',          icon: Zap },
  { value: 'Crosshair',  label: 'Control',           icon: Crosshair },
  { value: 'Scale',      label: 'Balance',           icon: Scale },
  { value: 'CircleDot',  label: 'Punto dulce',       icon: CircleDot },
  { value: 'Gauge',      label: 'Salida de bola',    icon: Gauge },
  { value: 'Activity',   label: 'Antivibración',     icon: Activity },

  // Forma y medidas
  { value: 'Diamond',    label: 'Forma diamante',    icon: Diamond },
  { value: 'Triangle',   label: 'Forma lágrima',     icon: Triangle },
  { value: 'Circle',     label: 'Forma redonda',     icon: Circle },
  { value: 'Weight',     label: 'Peso',              icon: Weight },
  { value: 'Ruler',      label: 'Perfil / marco',    icon: Ruler },
  { value: 'Maximize',   label: 'Superficie amplia', icon: Maximize },

  // Materiales y terminación
  { value: 'Layers',     label: 'Núcleo / goma',     icon: Layers },
  { value: 'Grid3x3',    label: 'Carbono / fibra',   icon: Grid3x3 },
  { value: 'Waves',      label: 'Superficie rugosa', icon: Waves },
  { value: 'Feather',    label: 'Liviana',           icon: Feather },
  { value: 'Sparkles',   label: 'Tecnología',        icon: Sparkles },
  { value: 'Hand',       label: 'Agarre',            icon: Hand },
  { value: 'Wind',       label: 'Aerodinámica',      icon: Wind },

  // Para quién es
  { value: 'TrendingUp', label: 'Nivel de juego',    icon: TrendingUp },
  { value: 'Swords',     label: 'Juego ofensivo',    icon: Swords },
  { value: 'Shield',     label: 'Juego defensivo',   icon: Shield },
  { value: 'User',       label: 'Jugador',           icon: User },
  { value: 'Footprints', label: 'Movilidad',         icon: Footprints },
  { value: 'Scissors',   label: 'Corte / efecto',    icon: Scissors },
  { value: 'Target',     label: 'Precisión',         icon: Target },

  // Lo que rodea a la compra
  { value: 'Award',      label: 'Garantía',          icon: Award },
  { value: 'Star',       label: 'Destacado',         icon: Star },
  { value: 'Package',    label: 'Incluye funda',     icon: Package },
  { value: 'Thermometer', label: 'Clima',            icon: Thermometer },
  { value: 'Droplets',   label: 'Resistente al agua', icon: Droplets },
];

const POR_VALOR = new Map(SPEC_ICONS.map((option) => [option.value, option.icon]));

/** Devuelve el icono guardado; si no se reconoce, uno neutro en vez de romper. */
export function specIcon(value: string | undefined): LucideIcon {
  return (value && POR_VALOR.get(value)) || Sparkles;
}
