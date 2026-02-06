// Stripe product/price mapping for subscription tiers
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    price_id: null,
    product_id: null,
    features: [
      "Écouter toutes les soumissions",
      "5 votes par semaine",
      "Profil basique",
    ],
    limits: {
      votes_per_week: 5,
      can_submit: false,
      analytics: false,
      ai_feedback: false,
      marketing_kit: false,
    },
  },
  pro: {
    name: "Pro",
    price: 9.99,
    price_id: "price_1SxwC0DFa5Y9NR1IzyElGuxb",
    product_id: "prod_TvnnCLdThflvd5",
    features: [
      "Tout Free +",
      "Soumettre 1 morceau / semaine",
      "Votes illimités",
      "Analytics de base",
      "Profil artiste personnalisé",
      "5 commentaires / semaine",
    ],
    limits: {
      votes_per_week: Infinity,
      can_submit: true,
      analytics: true,
      ai_feedback: false,
      marketing_kit: false,
    },
  },
  elite: {
    name: "Elite",
    price: 19.99,
    price_id: "price_1SxwC1DFa5Y9NR1I0VRck1kX",
    product_id: "prod_Tvnn1RBP7qVms7",
    features: [
      "Tout Pro +",
      "Analytics avancés (jour par jour)",
      "Feedback IA structuré",
      "Kit marketing automatique",
      "Badge Elite sur le profil",
      "Commentaires illimités",
      "Page artiste premium",
    ],
    limits: {
      votes_per_week: Infinity,
      can_submit: true,
      analytics: true,
      ai_feedback: true,
      marketing_kit: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
