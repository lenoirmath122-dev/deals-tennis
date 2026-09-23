import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated="23 septembre 2026">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le site Deals Tennis (accessible à l&apos;adresse deals-tennis.vercel.app) est édité par
          Mathieu Lenoir, personne physique agissant à titre individuel.
        </p>
        <p>Contact : lenoir.math122@gmail.com</p>
      </section>

      <section>
        <h2>Directeur de la publication</h2>
        <p>Mathieu Lenoir.</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc. Informations légales complètes de l&apos;hébergeur
          disponibles sur{" "}
          <a href="https://vercel.com/legal" target="_blank" rel="noopener noreferrer">
            vercel.com/legal
          </a>
          .
        </p>
        <p>
          La base de données du site est hébergée par Neon, Inc., agissant comme sous-traitant
          technique.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          La structure, le design et le code du site Deals Tennis sont la propriété de son
          éditeur. Les images, marques, noms de produits et logos des marchands référencés
          appartiennent à leurs propriétaires respectifs.
        </p>
      </section>

      <section>
        <h2>Liens vers des sites tiers</h2>
        <p>
          Deals Tennis référence des offres provenant de sites marchands tiers et y redirige
          l&apos;utilisateur. L&apos;éditeur n&apos;est pas responsable du contenu, du
          fonctionnement ni des pratiques de ces sites tiers, qui disposent de leurs propres
          mentions légales et conditions d&apos;utilisation.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Pour toute question relative au site, écrire à{" "}
          <a href="mailto:lenoir.math122@gmail.com">lenoir.math122@gmail.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}
