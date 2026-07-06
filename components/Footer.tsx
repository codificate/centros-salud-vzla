import Link from "next/link";

const CONTACT_EMAIL = "centrosdesaludvenezuela@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/servandoreyes/";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#171717]">
      <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-6 text-sm text-[#f2f2f2]">
        <p>
          Creado por:{" "}
          <Link
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-2 transition hover:underline focus:outline-none focus:ring-2 focus:ring-[#f2f2f2]/40"
          >
            Servando Reyes
          </Link>
        </p>
        <p>
          Contacto:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium underline-offset-2 transition hover:underline focus:outline-none focus:ring-2 focus:ring-[#f2f2f2]/40"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}
