# Interface Contract: External Workflow Ingestion & Synchronization (n8n)

**Purpose**: Définir le contrat d'alimentation et d'éviction automatique entre les workflows n8n et la base de données PostgreSQL (Neon Serverless) conformément aux Principes I, III et V de la Constitution.

---

## 1. Chaîne de connexion et authentification

- **Accès n8n** : Les workflows n8n utilisent la chaîne de connexion directe PostgreSQL fournie par Neon (ex: `postgres://<user>:<password>@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require`).
- **Nœud n8n** : Utilisation du nœud natif officiel **Postgres** de n8n pour les opérations d'insertion, de mise à jour et de requêtes cron.
- **Isolation** : Cette chaîne de connexion contient les droits de modification de données et ne doit JAMAIS être exposée publiquement.

---

## 2. Format de charge utile (Payload n8n -> `deals`)

Lorsqu'un workflow n8n détecte un bon plan chez un marchand partenaire, il formate l'enregistrement selon le schéma JSON suivant avant insertion ou mise à jour :

```json
{
  "title": "Raquette Head Speed Pro 2024",
  "brand": "Head",
  "category": "raquettes",
  "image_url": "https://img.tennis-warehouse-europe.com/products/HSPR24.jpg",
  "original_price": 280.00,
  "discounted_price": 189.90,
  "discount_percentage": 32,
  "merchant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "affiliate_url": "https://ad.zanox.com/ppc/?12345678&ulp=https://tennis-point.fr/head-speed-pro",
  "status": "active",
  "is_active": true,
  "expires_at": "2026-10-15T23:59:59Z"
}
```

### Règles de calcul obligatoires pour n8n
1. `discount_percentage` = `ROUND(((original_price - discounted_price) / original_price) * 100)`
2. `category` doit être strictement normalisé en minuscules parmi : `raquettes`, `cordages`, `chaussures`, `textile`, `accessoires`.
3. `original_price` doit être strictement supérieur à `discounted_price`.

---

## 3. Workflow d'éviction automatique (Cron Expirations)

Un workflow n8n planifié s'exécute selon une fréquence horaire (`0 * * * *`) pour purger ou marquer comme expirés les bons plans dont l'échéance est passée :

```sql
-- Requête exécutée par le nœud PostgreSQL dans n8n
UPDATE deals
SET 
  status = 'expired',
  is_active = false,
  updated_at = NOW()
WHERE 
  status = 'active'
  AND (
    (expires_at IS NOT NULL AND expires_at <= NOW())
    OR is_active = false
  );
```

Ce mécanisme garantit qu'aucune offre caduque ne persiste sur la plateforme sans nécessiter d'intervention humaine.
