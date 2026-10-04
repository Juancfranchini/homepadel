import {
  Activity, Award, Banknote, BarChart3, BadgeCheck, CreditCard, FileCheck, FileEdit, FileText, HelpCircle, Image, Info, Instagram,
  LayoutDashboard, Mail, Megaphone, MessageSquare, MessagesSquare, Package, Palette, Percent, PlaySquare, Receipt, RefreshCw, Ruler,
  Settings, Shapes, Shield, ShoppingBag, ShoppingCart, Sparkles, Star, Store, Tag, Tags, Truck, UserCheck, Users, Wallet,
} from 'lucide-react';

export interface ItemMenu {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface GrupoMenu {
  /** Sin título: siempre visible arriba (Inicio). */
  title?: string;
  items: ItemMenu[];
}

/**
 * Menú del backoffice, agrupado por tarea: lo del día a día arriba (ventas,
 * catálogo) y la configuración que se toca poco abajo. Para sumar una
 * pantalla, agregarla al grupo que corresponda; las direcciones no cambian.
 *
 * Antes "Landing Page" tenía 19 ítems mezclando el diseño de la portada, los
 * textos legales y configuraciones de cobro y envío (cuotas, tarifa), y
 * Branding, Canales de contacto, Newsletter e Info de reviews no figuraban
 * en ningún lado: solo se llegaba escribiendo la dirección.
 */
export const GRUPOS_MENU: GrupoMenu[] = [
  { items: [{ label: 'Inicio', href: '/', icon: LayoutDashboard }] },
  {
    title: 'Ventas',
    items: [
      { label: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
      { label: 'Carritos abandonados', href: '/carritos-abandonados', icon: ShoppingCart },
      { label: 'Clientes', href: '/clientes', icon: Users },
      { label: 'Punto de Venta', href: '/punto-de-venta', icon: Store },
      { label: 'Caja', href: '/caja', icon: Wallet },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Productos', href: '/productos', icon: Package },
      { label: 'Contenido de fichas', href: '/productos-contenido', icon: FileEdit },
      { label: 'Categorías', href: '/categorias', icon: Tags },
      { label: 'Marcas', href: '/marcas', icon: Award },
      { label: 'Formatos de paleta', href: '/configuracion/formatos-paleta', icon: Shapes },
      { label: 'Guía de talles', href: '/configuracion/talles', icon: Ruler },
      { label: 'Reviews', href: '/reviews', icon: Star },
      { label: 'Info de reviews', href: '/configuracion/reviews-info', icon: BadgeCheck },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Métricas (Meta)', href: '/marketing', icon: Activity },
      { label: 'Promociones', href: '/promociones', icon: Percent },
      { label: 'Cupones', href: '/cupones', icon: Tag },
      { label: 'Newsletter', href: '/newsletter', icon: Mail },
    ],
  },
  {
    title: 'Cobros y envíos',
    items: [
      { label: 'Medios de pago', href: '/configuracion/medios-pago', icon: CreditCard },
      { label: 'Cuotas', href: '/configuracion/cuotas', icon: CreditCard },
      { label: 'Tarifa de envío', href: '/configuracion/tarifa-envio', icon: Banknote },
      { label: 'Envíos (texto)', href: '/configuracion/envios', icon: Truck },
    ],
  },
  {
    title: 'Diseño de la tienda',
    items: [
      { label: 'Branding (logo)', href: '/configuracion/branding', icon: Palette },
      { label: 'Hero (portada)', href: '/hero', icon: PlaySquare },
      { label: 'Beneficios', href: '/beneficios', icon: Sparkles },
      { label: 'Banners', href: '/banners', icon: Image },
      { label: 'Sobre nosotros', href: '/configuracion/about', icon: Info },
      { label: 'Testimonios', href: '/testimonios', icon: MessageSquare },
      { label: 'Instagram', href: '/configuracion/instagram', icon: Instagram },
      { label: 'Mensaje final y newsletter', href: '/configuracion/mensaje-final', icon: Megaphone },
      { label: 'Confianza en fichas', href: '/configuracion/confianza-productos', icon: Shield },
      { label: 'Preguntas frecuentes', href: '/faq', icon: HelpCircle },
      { label: 'Contacto', href: '/contacto', icon: FileText },
      { label: 'Canales de contacto', href: '/configuracion/canales-contacto', icon: MessagesSquare },
    ],
  },
  {
    title: 'Páginas legales',
    items: [
      { label: 'Cambios y devoluciones', href: '/configuracion/paginas', icon: RefreshCw },
      { label: 'Privacidad', href: '/configuracion/privacidad', icon: UserCheck },
      { label: 'Términos y condiciones', href: '/configuracion/terminos', icon: FileCheck },
    ],
  },
  {
    title: 'Administración',
    items: [
      { label: 'Estadísticas de ventas', href: '/estadisticas-ventas', icon: BarChart3 },
      { label: 'Gastos', href: '/gastos', icon: Receipt },
      { label: 'Equipo PDV', href: '/equipo-pdv', icon: Shield },
      { label: 'Configuración PDV', href: '/configuracion-pdv', icon: Settings },
      { label: 'Configuración general', href: '/configuracion', icon: Settings },
    ],
  },
];

/** Rutas que tienen subpáginas propias en el menú: se marcan solo si coinciden exacto. */
const EXACTAS = ['/', '/productos', '/configuracion'];

export function rutaActiva(pathname: string, href: string): boolean {
  if (EXACTAS.includes(href)) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}
