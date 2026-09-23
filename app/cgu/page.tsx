import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
};

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation" updated="23 septembre 2026">
      <section>
        <h2>Objet du site</h2>
        <p>
          Deals Tennis est un site qui référence et compare des offres promotionnelles sur du
          matériel de tennis (raquettes, cordages, chaussures, textile, accessoires) proposées par
          des sites marchands tiers. Deals Tennis ne vend aucun produit directement : cliquer sur
          une offre redirige l&apos;utilisateur vers le site du marchand concerné, où la
          transaction, si elle a lieu, se déroule intégralement.
        </p>
      </section>

      <section>
        <h2>Accès au site</h2>
        <p>
          Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à
          Internet. Aucune création de compte n&apos;est nécessaire ni proposée à ce jour.
        </p>
      </section>

      <section>
        <h2>Informations affichées</h2>
        <p>
          Les prix, réductions, disponibilités et descriptions affichés sur Deals Tennis
          proviennent des sites marchands référencés et sont fournis à titre indicatif. Ils
          peuvent évoluer ou devenir caducs (prix modifié, rupture de stock, offre expirée) entre
          le moment où l&apos;offre a été relevée et le moment où l&apos;utilisateur consulte le
          site marchand. Le prix et les conditions de vente qui font foi sont ceux affichés sur le
          site du marchand au moment de l&apos;achat.
        </p>
      </section>

      <section>
        <h2>Responsabilité</h2>
        <p>
          Deals Tennis n&apos;intervient à aucun moment dans la vente, la livraison, le paiement
          ou le service après-vente des produits achetés sur les sites marchands référencés. Ces
          transactions sont exclusivement régies par les conditions générales de vente du marchand
          concerné. Deals Tennis ne saurait être tenu responsable d&apos;un litige survenant entre
          un utilisateur et un marchand.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Le contenu propre au site (structure, design, textes de présentation) est protégé par le
          droit d&apos;auteur. Toute reproduction non autorisée est interdite. Les visuels et
          noms de produits affichés appartiennent aux marchands ou fabricants concernés.
        </p>
      </section>

      <section>
        <h2>Modification des présentes conditions</h2>
        <p>
          Ces conditions générales d&apos;utilisation peuvent être modifiées à tout moment, afin
          notamment de refléter l&apos;évolution du site. La version en vigueur est celle publiée
          sur cette page.
        </p>
      </section>

      <section>
        <h2>Droit applicable</h2>
        <p>
          Les présentes conditions sont soumises au droit français. Tout litige relatif à leur
          interprétation ou leur exécution relève des juridictions françaises compétentes.
        </p>
      </section>
    </LegalPage>
  );
}
