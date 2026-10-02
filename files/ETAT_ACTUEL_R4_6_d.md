# ETAT_ACTUEL — R4.6-d

## 2026-10-01

### Constat
- Run fantôme r4.6-b utilisé pour la décision : `5bc68805-0d71-4895-b2bd-87a56a17f234` (dry-run).
- Arbitrage textile : 15 groupes multi-marchands.
  - **Retenir** : 98, 195, 445, 639, 702, 1597, 2493, 3152, 3523
  - **Séparer** : 787, 909, 1101, 1171, 1829, 2026

### Exécution écriture en base (match fantôme)
- Moteur : `npm run match:shadow -- --out rapport-r4.6-d-prod-write`
- Run écrit : `87987663-56cc-4fe7-adc3-2955405a716a`
- Résultats du rapport :
  - Offres lues : 5035
  - Reconnaissances : 4722 / 5035 (313 non reconnues)
  - Modèles : 4011
  - Liens : 4732
  - Textiles : 15 modèles multi-marchands

### Note tests
- `npm run test:unit` échoue faute de `DATABASE_URL` défini (test env).

## Prochaine étape
- Confirmer côté suivi / Mathieu la cohérence textile et les impacts sur le site.
- Préparer la demande d’autorisation/PR si une bascule additionnelle est requise.
