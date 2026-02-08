

# Mise a jour du contact officiel : contact@emotionscare.com

## Contexte

L'entreprise editrice est **EMOTIONSCARE SASU** (SIREN 944 505 445). Toutes les references email doivent pointer vers **contact@emotionscare.com** au lieu de contact@weeklymusicawards.com.

## Fichiers a modifier (4 fichiers)

| Fichier | Modification |
|---------|-------------|
| `src/components/layout/Footer.tsx` | Remplacer `contact@weeklymusicawards.com` par `contact@emotionscare.com` (href + texte affiche) |
| `src/pages/About.tsx` | Remplacer le `mailto:contact@weeklymusicawards.com` par `mailto:contact@emotionscare.com` |
| `src/pages/Privacy.tsx` | Remplacer `privacy@weeklymusicawards.com` par `contact@emotionscare.com` |
| `src/pages/Terms.tsx` | Ajouter une mention editeur en fin de page : "Editeur : EMOTIONSCARE SASU - SIREN 944 505 445" (obligation legale pour les CGU) |

## Detail des modifications

### Footer.tsx (lignes 55-58)
- `href="mailto:contact@emotionscare.com"`
- Texte affiche : `contact@emotionscare.com`

### About.tsx (ligne 168)
- `href="mailto:contact@emotionscare.com"`

### Privacy.tsx (ligne 24)
- Remplacer "privacy@weeklymusicawards.com" par "contact@emotionscare.com"

### Terms.tsx
- Ajouter avant le paragraphe de disclaimer en fin de page :
  "Editeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com"

Total : 4 fichiers modifies, 0 fichier cree.

