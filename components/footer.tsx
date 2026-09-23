import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/affiliation", label: "Affiliation" },
];

export function Footer() {
  return (
    <footer className="border-t border-card-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="hover:text-accent">
            Deals Tennis
          </Link>
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
