import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Affiliation",
};

export default function AffiliationPage() {
  return (
    <LegalPage title="Affiliation" updated="23 septembre 2026">
      <section>
        <h2>Comment fonctionne Tennisdeals</h2>
        <p>
          Tennisdeals référence des offres promotionnelles sur du matériel de tennis provenant de
          marchands partenaires (actuellement ProTennis) et redirige l&apos;utilisateur vers leur
          site pour finaliser un éventuel achat. Tennisdeals ne vend aucun produit directement.
        </p>
      </section>

      <section>
        <h2>Liens d&apos;affiliation</h2>
        <p>
          Certains liens présents sur ce site sont des liens d&apos;affiliation : si un utilisateur
          clique sur une offre puis effectue un achat sur le site du marchand, Tennisdeals peut
          percevoir une commission de la part de ce marchand. Cette commission n&apos;a aucune
          incidence sur le prix payé par l&apos;utilisateur, qui reste identique à celui affiché
          par le marchand.
        </p>
      </section>

      <section>
        <h2>Indépendance de la sélection</h2>
        <p>
          La présence d&apos;une commission d&apos;affiliation n&apos;influence pas le classement
          ni la mise en avant des offres sur le site, qui reposent sur des critères objectifs
          (prix, taux de réduction, disponibilité). Un marchand partenaire n&apos;est ni favorisé
          ni mis en avant du seul fait de son statut de partenaire.
        </p>
      </section>

      <section>
        <h2>Fiabilité des informations</h2>
        <p>
          Les prix et informations affichés sont relevés automatiquement et mis à jour
          régulièrement, mais peuvent différer de ceux constatés sur le site du marchand au moment
          de l&apos;achat. Voir les{" "}
          <a href="/cgu">conditions générales d&apos;utilisation</a> pour plus de détail.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Pour toute question sur ce fonctionnement, écrire à{" "}
          <a href="mailto:lenoir.math122@gmail.com">lenoir.math122@gmail.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}
