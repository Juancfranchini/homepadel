import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Guía de Talles | Home Pádel',
  description: 'Guía completa de talles para paletas, zapatillas e indumentaria de pádel.',
};

const PALETAS = [
  { nivel: 'Iniciante', forma: 'Redonda', balance: 'Bajo', nucleo: 'Foam / EVA suave', control: '★★★★★', potencia: '★★☆☆☆', recomendado: 'Si empezás a jugar' },
  { nivel: 'Intermedio', forma: 'Lágrima', balance: 'Medio', nucleo: 'EVA / HR3', control: '★★★★☆', potencia: '★★★☆☆', recomendado: 'Nivel club, en desarrollo' },
  { nivel: 'Avanzado', forma: 'Diamante', balance: 'Alto', nucleo: 'HR3 / Carbon', control: '★★★☆☆', potencia: '★★★★★', recomendado: 'Jugador competitivo' },
];

const ZAPATILLAS_HOMBRE = [
  { arg: '39', eu: '40', uk: '6', us: '7', cm: '25' },
  { arg: '40', eu: '41', uk: '7', us: '8', cm: '25.5' },
  { arg: '41', eu: '42', uk: '8', us: '9', cm: '26.5' },
  { arg: '42', eu: '43', uk: '9', us: '10', cm: '27' },
  { arg: '43', eu: '44', uk: '10', us: '11', cm: '27.5' },
  { arg: '44', eu: '45', uk: '11', us: '12', cm: '28.5' },
  { arg: '45', eu: '46', uk: '12', us: '13', cm: '29' },
];

const ROPA = [
  { talle: 'XS', pecho: '82-86', cintura: '68-72', cadera: '90-94' },
  { talle: 'S', pecho: '87-92', cintura: '73-77', cadera: '95-99' },
  { talle: 'M', pecho: '93-98', cintura: '78-82', cadera: '100-104' },
  { talle: 'L', pecho: '99-104', cintura: '83-88', cadera: '105-110' },
  { talle: 'XL', pecho: '105-111', cintura: '89-95', cadera: '111-117' },
  { talle: 'XXL', pecho: '112-118', cintura: '96-102', cadera: '118-124' },
];

export default function TallesPage() {
  return (
    <div className="min-h-screen bg-[#050606] text-white">

      {/* BREADCRUMB */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">Guía de Talles</span>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-14 text-center">
        <p className="text-[#B7D31A] text-xs font-black uppercase tracking-[0.2em] mb-3">REFERENCIA</p>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
          Guía de Talles
        </h1>
        <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl mx-auto">
          Encontrá el talle correcto para paletas, zapatillas e indumentaria.
          Ante cualquier duda, consultanos antes de comprar.
        </p>
      </section>

      {/* PALETAS */}
      <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-2">
            PALETAS — GUÍA POR NIVEL
          </h2>
          <p className="text-[#A1A1AA] text-sm mb-8">Elegí la paleta según tu nivel de juego y estilo preferido.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PALETAS.map((p, i) => (
              <div key={i} className={`bg-[#0C0C0C] border rounded-2xl p-6 ${i === 1 ? 'border-[#B7D31A]/30' : 'border-white/[0.08]'}`}>
                {i === 1 && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#B7D31A] bg-[#B7D31A]/10 px-2 py-1 rounded mb-3 inline-block">
                    MÁS VENDIDO
                  </span>
                )}
                <h3 className={`font-black text-lg mb-3 ${i === 1 ? 'text-[#B7D31A]' : 'text-white'}`}>{p.nivel}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#A1A1AA]">Forma</span><span className="text-white font-semibold">{p.forma}</span></div>
                  <div className="flex justify-between"><span className="text-[#A1A1AA]">Balance</span><span className="text-white font-semibold">{p.balance}</span></div>
                  <div className="flex justify-between"><span className="text-[#A1A1AA]">Núcleo</span><span className="text-white font-semibold">{p.nucleo}</span></div>
                  <div className="flex justify-between"><span className="text-[#A1A1AA]">Control</span><span className="text-xs">{p.control}</span></div>
                  <div className="flex justify-between"><span className="text-[#A1A1AA]">Potencia</span><span className="text-xs">{p.potencia}</span></div>
                </div>
                <p className="mt-4 text-[10px] text-[#B7D31A] font-semibold uppercase border-t border-white/[0.06] pt-3">
                  {p.recomendado}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZAPATILLAS */}
      <section className="border-t border-white/[0.06] py-14">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-2">
            ZAPATILLAS — TABLA DE EQUIVALENCIAS
          </h2>
          <p className="text-[#A1A1AA] text-sm mb-8">Tabla de equivalencias para calzado masculino. Para calzado femenino, resta 1 talle.</p>
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0C0C0C]">
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#B7D31A] px-5 py-3">ARG</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] px-5 py-3">EU</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] px-5 py-3">UK</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] px-5 py-3">US</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] px-5 py-3">CM</th>
                </tr>
              </thead>
              <tbody>
                {ZAPATILLAS_HOMBRE.map((z, i) => (
                  <tr key={i} className={`border-b border-white/[0.06] ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3 text-white font-bold text-sm">{z.arg}</td>
                    <td className="px-5 py-3 text-[#A1A1AA] text-sm">{z.eu}</td>
                    <td className="px-5 py-3 text-[#A1A1AA] text-sm">{z.uk}</td>
                    <td className="px-5 py-3 text-[#A1A1AA] text-sm">{z.us}</td>
                    <td className="px-5 py-3 text-[#A1A1AA] text-sm">{z.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[#A1A1AA] text-xs mt-3">
            * Si estás entre dos talles, te recomendamos elegir el mayor para mayor comodidad.
          </p>
        </div>
      </section>

      {/* ROPA */}
      <section className="border-t border-white/[0.06] py-14 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-2">
            INDUMENTARIA — GUÍA DE TALLES
          </h2>
          <p className="text-[#A1A1AA] text-sm mb-8">Medidas en centímetros. Medite con la cinta métrica sin ropa ajustada.</p>
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0C0C0C]">
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#B7D31A] px-5 py-3">Talle</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] px-5 py-3">Pecho (cm)</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] px-5 py-3">Cintura (cm)</th>
                  <th className="text-left text-xs font-black uppercase tracking-widest text-[#A1A1AA] px-5 py-3">Cadera (cm)</th>
                </tr>
              </thead>
              <tbody>
                {ROPA.map((r, i) => (
                  <tr key={i} className={`border-b border-white/[0.06] ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3 text-white font-bold text-sm">{r.talle}</td>
                    <td className="px-5 py-3 text-[#A1A1AA] text-sm">{r.pecho}</td>
                    <td className="px-5 py-3 text-[#A1A1AA] text-sm">{r.cintura}</td>
                    <td className="px-5 py-3 text-[#A1A1AA] text-sm">{r.cadera}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AYUDA */}
      <section className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#A1A1AA] text-sm mb-4">¿Tenés dudas sobre qué talle elegir?</p>
          <a
            href="https://wa.me/5491131813297"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-black text-sm rounded-xl hover:bg-green-400 transition-colors"
          >
            <MessageCircle size={16} />
            Consultanos por WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
