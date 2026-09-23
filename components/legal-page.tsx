import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-zinc-500">Dernière mise à jour : {updated}</p>
      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-zinc-700 [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </main>
  );
}
