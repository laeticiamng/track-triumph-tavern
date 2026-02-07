

# Correction : Boutons et titre invisibles sur mobile

## Problemes identifies (screenshots)

1. **Boutons CTA invisibles** : Les boutons "Participer gratuitement" et "Creer mon compte gratuit" utilisent `bg-primary-foreground text-foreground`. En dark mode, les deux couleurs sont quasi-blanches (100% vs 95%), rendant le texte invisible sur le fond.

2. **Titre H1 coupe** : Le titre "Le concours musical" est partiellement cache par le header fixe (64px). Le conteneur hero utilise `justify-center` avec `min-h-[80vh]` mais le contenu remonte trop haut sur petit ecran.

---

## Corrections

### 1. Boutons CTA - Contraste texte (CRITIQUE)

**Fichier** : `src/components/landing/HeroSection.tsx`
- Remplacer `text-foreground` par `text-background` sur le bouton principal (ligne 97)
- En dark mode, `--background` est `240 10% 4%` (quasi-noir), ce qui donne un contraste parfait sur fond blanc

**Fichier** : `src/components/landing/CTASection.tsx`
- Meme correction sur le bouton "Creer mon compte gratuit" (ligne 32)

### 2. Titre H1 - Espacement header

**Fichier** : `src/components/landing/HeroSection.tsx`
- Augmenter le padding top du conteneur de `py-24` a `pt-32 pb-24` pour compenser le header fixe de 64px
- Cela garantit que le H1 est toujours visible sans etre coupe

---

## Detail technique

| Fichier | Ligne | Avant | Apres |
|---|---|---|---|
| `HeroSection.tsx` | 35 | `py-24` | `pt-32 pb-24` |
| `HeroSection.tsx` | 97 | `text-foreground` | `text-background` |
| `CTASection.tsx` | 32 | `text-foreground` | `text-background` |

3 lignes modifiees dans 2 fichiers. Zero risque de regression.

