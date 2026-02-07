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
      "Accès au classement en direct",
      "Découvrir tous les artistes",
      "Profil basique",
    ],
    limits: {
      votes_per_week: 5,
      can_submit: false,
      analytics: false,
      ai_feedback: false,
      marketing_kit: false,
      comments_per_week: 0,
    },
  },
  pro: {
    name: "Pro",
    price: 9.99,
    price_id: "price_1SxwC0DFa5Y9NR1IzyElGuxb",
    product_id: "prod_TvnnCLdThflvd5",
    features: [
      "Soumettre 1 morceau par semaine",
      "Votes illimités",
      "5 commentaires par semaine sur les votes",
      "Profil artiste personnalisé (avatar, liens sociaux)",
      "Statistiques de votes sur votre profil",
      "Écoute, classement et découverte inclus",
    ],
    limits: {
      votes_per_week: Infinity,
      can_submit: true,
      analytics: true,
      ai_feedback: false,
      marketing_kit: false,
      comments_per_week: 5,
    },
  },
  elite: {
    name: "Elite",
    price: 19.99,
    price_id: "price_1SxwC1DFa5Y9NR1I0VRck1kX",
    product_id: "prod_Tvnn1RBP7qVms7",
    features: [
      "Soumettre 1 morceau par semaine",
      "Votes et commentaires illimités",
      "Feedback IA structuré (analyse détaillée)",
      "Profil artiste premium (avatar, banner, liens sociaux)",
      "Badge Elite sur le profil",
      "Statistiques de votes détaillées",
    ],
    limits: {
      votes_per_week: Infinity,
      can_submit: true,
      analytics: true,
      ai_feedback: true,
      marketing_kit: false,
      comments_per_week: Infinity,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
