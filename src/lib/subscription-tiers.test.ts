import { describe, it, expect } from "vitest";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "./subscription-tiers";

const tierKeys: SubscriptionTier[] = ["free", "pro", "elite"];

describe("SUBSCRIPTION_TIERS", () => {
  it("defines exactly three tiers: free, pro, and elite", () => {
    const keys = Object.keys(SUBSCRIPTION_TIERS);
    expect(keys).toHaveLength(3);
    expect(keys).toContain("free");
    expect(keys).toContain("pro");
    expect(keys).toContain("elite");
  });

  describe.each(tierKeys)("%s tier", (tierKey) => {
    const tier = SUBSCRIPTION_TIERS[tierKey];

    it("has a name string", () => {
      expect(typeof tier.name).toBe("string");
      expect(tier.name.length).toBeGreaterThan(0);
    });

    it("has a numeric price", () => {
      expect(typeof tier.price).toBe("number");
      expect(tier.price).toBeGreaterThanOrEqual(0);
    });

    it("has a non-empty features array", () => {
      expect(Array.isArray(tier.features)).toBe(true);
      expect(tier.features.length).toBeGreaterThan(0);
    });

    it("has only string entries in features", () => {
      tier.features.forEach((feature) => {
        expect(typeof feature).toBe("string");
        expect(feature.length).toBeGreaterThan(0);
      });
    });

    it("has a limits object with required keys", () => {
      expect(tier.limits).toBeDefined();
      expect(typeof tier.limits.votes_per_week).toBe("number");
      expect(typeof tier.limits.can_submit).toBe("boolean");
      expect(typeof tier.limits.analytics).toBe("boolean");
      expect(typeof tier.limits.ai_feedback).toBe("boolean");
      expect(typeof tier.limits.marketing_kit).toBe("boolean");
      expect(typeof tier.limits.comments_per_week).toBe("number");
    });
  });

  describe("free tier specifics", () => {
    const free = SUBSCRIPTION_TIERS.free;

    it("has a price of 0", () => {
      expect(free.price).toBe(0);
    });

    it("has null price_id and product_id", () => {
      expect(free.price_id).toBeNull();
      expect(free.product_id).toBeNull();
    });

    it("does not allow submissions", () => {
      expect(free.limits.can_submit).toBe(false);
    });

    it("limits votes to 5 per week", () => {
      expect(free.limits.votes_per_week).toBe(5);
    });

    it("does not allow comments", () => {
      expect(free.limits.comments_per_week).toBe(0);
    });

    it("does not include analytics or AI feedback", () => {
      expect(free.limits.analytics).toBe(false);
      expect(free.limits.ai_feedback).toBe(false);
    });
  });

  describe("pro tier specifics", () => {
    const pro = SUBSCRIPTION_TIERS.pro;

    it("has a positive price", () => {
      expect(pro.price).toBe(9.99);
    });

    it("has a non-null price_id", () => {
      expect(pro.price_id).toBeTruthy();
      expect(typeof pro.price_id).toBe("string");
    });

    it("has a non-null product_id", () => {
      expect(pro.product_id).toBeTruthy();
      expect(typeof pro.product_id).toBe("string");
    });

    it("allows submissions", () => {
      expect(pro.limits.can_submit).toBe(true);
    });

    it("has unlimited votes", () => {
      expect(pro.limits.votes_per_week).toBe(Infinity);
    });

    it("limits comments to 5 per week", () => {
      expect(pro.limits.comments_per_week).toBe(5);
    });

    it("includes analytics but not AI feedback", () => {
      expect(pro.limits.analytics).toBe(true);
      expect(pro.limits.ai_feedback).toBe(false);
    });
  });

  describe("elite tier specifics", () => {
    const elite = SUBSCRIPTION_TIERS.elite;

    it("has a higher price than pro", () => {
      expect(elite.price).toBeGreaterThan(SUBSCRIPTION_TIERS.pro.price);
      expect(elite.price).toBe(19.99);
    });

    it("has a non-null price_id", () => {
      expect(elite.price_id).toBeTruthy();
      expect(typeof elite.price_id).toBe("string");
    });

    it("has a non-null product_id", () => {
      expect(elite.product_id).toBeTruthy();
      expect(typeof elite.product_id).toBe("string");
    });

    it("allows submissions", () => {
      expect(elite.limits.can_submit).toBe(true);
    });

    it("has unlimited votes and comments", () => {
      expect(elite.limits.votes_per_week).toBe(Infinity);
      expect(elite.limits.comments_per_week).toBe(Infinity);
    });

    it("includes both analytics and AI feedback", () => {
      expect(elite.limits.analytics).toBe(true);
      expect(elite.limits.ai_feedback).toBe(true);
    });
  });

  describe("tier ordering", () => {
    it("prices are in ascending order: free < pro < elite", () => {
      expect(SUBSCRIPTION_TIERS.free.price).toBeLessThan(SUBSCRIPTION_TIERS.pro.price);
      expect(SUBSCRIPTION_TIERS.pro.price).toBeLessThan(SUBSCRIPTION_TIERS.elite.price);
    });
  });
});
