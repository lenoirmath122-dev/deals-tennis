# Interface Contract: Internal Redirection & Click Tracking

**Endpoint**: `GET /go/:dealId`
**Type**: Next.js Route Handler (`app/go/[dealId]/route.ts`)
**Purpose**: Rediriger le visiteur vers le lien d'affiliation du marchand tout en consignant l'événement de clic de façon anonyme et instantanée (FR-006, FR-007, FR-010).

---

## 1. Requête Entrante

- **Méthode** : `GET`
- **Chemin** : `/go/:dealId`
- **Paramètres d'URL** :
  - `dealId` (UUID, obligatoire) : Identifiant unique du bon plan ciblé.
- **En-têtes HTTP exploités** :
  - `User-Agent` : Utilisé uniquement pour classifier l'appareil (`mobile`, `desktop`, `tablet`, `unknown`). L'en-tête brut n'est pas stocké.
  - `Referer` : URL interne appelante (ex: `https://monsite.fr/?category=raquettes`), tronquée et nettoyée.

---

## 2. Comportements & Réponses HTTP

### Cas 1 : Bon plan valide et actif (Succès standard)
- **Condition** : Le bon plan existe, `status = 'active'`, `is_active = true`, et `(expires_at IS NULL OR expires_at > NOW())`.
- **Traitement interne** :
  1. Insérer de manière asynchrone dans `click_events` :
     ```json
     {
       "deal_id": ":dealId",
       "device_type": "mobile | desktop | tablet | unknown",
       "referrer_url": "chemin_interne_nettoye",
       "clicked_at": "NOW()"
     }
     ```
  2. Renvoyer la redirection HTTP.
- **Réponse HTTP** :
  - **Code de statut** : `307 Temporary Redirect` (ou `302 Found`)
  - **En-tête `Location`** : `:affiliate_url` (l'URL marchande avec tag d'affiliation)
  - **En-tête `Cache-Control`** : `no-store, no-cache, must-revalidate` (pour forcer le transit par le routeur lors de chaque clic)

---

### Cas 2 : Bon plan expiré ou invalidé (Gestion d'expiration - FR-010)
- **Condition** : Le bon plan existe mais `status != 'active'` ou `expires_at <= NOW()`.
- **Traitement interne** :
  - Aucun clic d'affiliation n'est envoyé vers le marchand.
  - Journalisation facultative d'un compteur d'accès post-expiration.
- **Réponse HTTP** :
  - **Code de statut** : `307 Temporary Redirect`
  - **En-tête `Location`** : `/?notification=deal-expired`
  - **En-tête `Cache-Control`** : `no-store`

---

### Cas 3 : Bon plan inexistant (404)
- **Condition** : Aucun enregistrement correspondant à `:dealId`.
- **Réponse HTTP** :
  - **Code de statut** : `307 Temporary Redirect`
  - **En-tête `Location`** : `/?notification=deal-not-found`

---

## 3. Détection du type d'appareil (Algorithme simple et léger)

```typescript
function resolveDeviceType(userAgentHeader: string | null): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  if (!userAgentHeader) return 'unknown';
  const ua = userAgentHeader.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|blackberry|phone/i.test(ua)) return 'mobile';
  return 'desktop';
}
```
