import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Tennisdeals : absence de compte utilisateur, statistiques de clic anonymes, cookies et sous-traitants techniques (hébergement, base de données).",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="23 septembre 2026">
      <section>
        <h2>Aucun compte, aucune donnée personnelle collectée directement</h2>
        <p>
          Tennisdeals ne propose pas de création de compte et ne demande à l&apos;utilisateur
          aucune information personnelle (nom, email, adresse) pour consulter le site ou utiliser
          la recherche.
        </p>
      </section>

      <section>
        <h2>Statistiques de clic anonymes</h2>
        <p>
          Lorsqu&apos;un utilisateur clique sur une offre pour être redirigé vers le site
          marchand, Tennisdeals enregistre une statistique associée à cette offre : le type
          d&apos;appareil utilisé (mobile, tablette, ordinateur) et, le cas échéant, la page interne
          du site depuis laquelle le clic a eu lieu. Cette statistique n&apos;est reliée à aucun
          identifiant permettant de reconnaître un utilisateur individuel (pas d&apos;adresse IP
          enregistrée, pas de cookie, pas de compte).
        </p>
      </section>

      <section>
        <h2>Cookies et traceurs</h2>
        <p>
          À ce jour, Tennisdeals n&apos;installe aucun cookie de mesure d&apos;audience ni aucun
          traceur publicitaire tiers. Cette page sera mise à jour si un tel outil venait à être
          ajouté, avec le recueil du consentement requis par la réglementation en vigueur.
        </p>
      </section>

      <section>
        <h2>Hébergement et sous-traitants techniques</h2>
        <p>
          Le site est hébergé par Vercel Inc. et sa base de données par Neon, Inc. Dans le cadre
          normal du fonctionnement de ces services, ces prestataires peuvent être amenés à traiter
          des données techniques de connexion (par exemple une adresse IP, dans leurs journaux
          serveur), conformément à leurs propres politiques de confidentialité.
        </p>
      </section>

      <section>
        <h2>Liens vers les sites marchands</h2>
        <p>
          Une fois redirigé vers un site marchand, l&apos;utilisateur est soumis à la politique de
          confidentialité de ce site tiers, indépendante de celle de Tennisdeals.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Compte tenu de l&apos;absence de compte utilisateur et de données personnelles
          identifiantes collectées, l&apos;exercice des droits d&apos;accès, de rectification ou
          de suppression prévus par le RGPD n&apos;a en pratique pas d&apos;objet direct sur ce
          site. Pour toute question, écrire à{" "}
          <a href="mailto:lenoir.math122@gmail.com">lenoir.math122@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2>Modification de cette politique</h2>
        <p>
          Cette politique peut être mise à jour, notamment en cas d&apos;ajout d&apos;un outil de
          mesure d&apos;audience ou de toute fonctionnalité nécessitant la collecte de nouvelles
          données. La date de dernière mise à jour figure en haut de cette page.
        </p>
      </section>
    </LegalPage>
  );
}
