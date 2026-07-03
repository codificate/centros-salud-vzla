import { IconShieldCheck, IconLock } from "@tabler/icons-react";
import Navbar from "@/components/Navbar";

/**
 * AboutUsScreen — "/acerca"
 *
 * Cohesive with the app (max-w-3xl, slate + sky). Signature element: a
 * heartbeat (ECG) hairline under the hero that ties to the health subject.
 * "Nuestra Postura" is set apart as a stance card — it carries a different
 * register (a civic disclaimer) than the trust sections above it.
 */
export default function AboutUsScreen() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Hero */}
        <header className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-700">
            Acerca de
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Sobre Nosotros
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Esta plataforma nace con un propósito fundamental: dar visibilidad a
            las necesidades reales de nuestros centros de salud a través de las
            voces de quienes están en la primera línea. Somos una herramienta
            tecnológica que permite al personal médico venezolano registrar y
            actualizar los insumos que requieren las clínicas y hospitales del
            país, creando una red de información transparente y enfocada en la
            acción.
          </p>

          {/* Signature: heartbeat hairline */}
          <Heartbeat className="mt-8" />
        </header>

        {/* Trust sections */}
        <div className="space-y-10">
          <Section
            icon={<IconShieldCheck className="h-5 w-5" stroke={1.75} aria-hidden />}
            title="Confianza y Ética Profesional"
          >
            <p>
              Sabemos que la veracidad de esta información puede salvar vidas.
              Por ello, la capacidad de reportar necesidades es exclusiva para
              personal de salud certificado. Validamos la identidad de cada
              usuario a través de su Cédula de Identidad y su número del
              Ministerio del Poder Popular para la Salud (MPPS). Esta validación
              se sostiene sobre una base irrompible: la confianza en la
              humanidad, la vocación y la honestidad que caracteriza a los
              profesionales de la salud venezolanos.
            </p>
          </Section>

          <Section
            icon={<IconLock className="h-5 w-5" stroke={1.75} aria-hidden />}
            title="Privacidad y Seguridad Inquebrantables"
          >
            <p>
              Tu seguridad y privacidad son innegociables. El proceso de
              registro utiliza inteligencia artificial para leer tu documento de
              identidad de forma automatizada y efímera.{" "}
              <strong className="font-semibold text-slate-900">
                Nunca guardamos la fotografía de tu cédula.
              </strong>{" "}
              Nuestro sistema únicamente almacena tu número de documento de forma
              estrictamente encriptada junto a tu credencial del MPPS. Nos
              comprometemos a proteger tu identidad; esta plataforma nunca
              venderá, cederá, ni compartirá tus datos con terceros.
            </p>
          </Section>
        </div>

        {/* Stance card — distinct register from the trust sections */}
        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            Nuestra Postura
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Esta plataforma es una iniciativa civil y tecnológica diseñada
            exclusivamente como una ayuda para la sociedad y para facilitar la
            logística de recursos médicos. Es importante aclarar que esta
            herramienta{" "}
            <strong className="font-semibold text-slate-900">
              no pretende sustituir, encubrir, ni eximir
            </strong>{" "}
            las responsabilidades y obligaciones constitucionales de las
            autoridades gubernamentales del Estado venezolano de dotar
            adecuadamente los centros médicos y garantizar el derecho a la salud
            de todos los ciudadanos.
          </p>
        </section>
      </main>
    </>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-8">
      <div className="flex items-center gap-2 text-sky-700">
        {icon}
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      <div className="mt-3 space-y-4 text-base leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

/** ECG / heartbeat line — flatline into a single pulse, then flat again. */
function Heartbeat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 40"
      className={`h-8 w-full max-w-sm text-emerald-500 ${className}`}
      fill="none"
      role="img"
      aria-label="Latido"
    >
      <path
        d="M0 20 H120 l8 -14 l10 28 l9 -22 l7 14 H320"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
