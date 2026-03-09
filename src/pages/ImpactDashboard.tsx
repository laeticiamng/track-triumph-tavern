import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Users, Globe, Accessibility, TrendingUp, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

const kpis = [
  { labelKey: "impact.kpi.activeCreators", value: "2 430", changeKey: "+18%", icon: Users },
  { labelKey: "impact.kpi.firstTimeCreators", value: "612", changeKey: "+32%", icon: TrendingUp },
  { labelKey: "impact.kpi.countriesRepresented", value: "19", changeKey: "+3", icon: Globe },
  { labelKey: "impact.kpi.inclusionArtists", value: "184", changeKey: "+45%", icon: Accessibility },
];

const geoDataKeys = [
  { countryKey: "impact.geo.france", count: 580 },
  { countryKey: "impact.geo.germany", count: 340 },
  { countryKey: "impact.geo.spain", count: 290 },
  { countryKey: "impact.geo.italy", count: 260 },
  { countryKey: "impact.geo.poland", count: 180 },
  { countryKey: "impact.geo.netherlands", count: 150 },
  { countryKey: "impact.geo.belgium", count: 130 },
  { countryKey: "impact.geo.portugal", count: 110 },
];

const diversityData = [
  { name: "18-24", value: 38, color: "hsl(var(--primary))" },
  { name: "25-34", value: 32, color: "hsl(var(--chart-2))" },
  { name: "35-44", value: 18, color: "hsl(var(--chart-3))" },
  { name: "45+", value: 12, color: "hsl(var(--chart-4))" },
];

const ImpactDashboard = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const anim = shouldReduceMotion ? { initial: {}, animate: {} } : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
  const geoData = geoDataKeys.map((g) => ({ country: t(g.countryKey), count: g.count }));

  return (
    <Layout>
      <SEOHead
        title={t("impact.seo.title")}
        description={t("impact.seo.description")}
        url="/impact"
      />

      <section className="py-20 md:py-28">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
              <BarChart3 className="h-3.5 w-3.5" />
              {t("impact.badge")}
            </span>
            <h1 className="font-display text-4xl font-bold sm:text-5xl mb-4">
              {t("impact.titlePrefix")} <span className="text-primary">{t("impact.titleHighlight")}</span> {t("impact.titleSuffix")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("impact.subtitle")}
            </p>
          </motion.div>

          <Alert className="mb-10 max-w-2xl mx-auto border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
              {t("impact.demoWarning")}
            </AlertDescription>
          </Alert>

          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {kpis.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div key={k.labelKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{k.changeKey}</span>
                      </div>
                      <p className="text-3xl font-bold">{k.value}</p>
                      <p className="text-sm text-muted-foreground">{t(k.labelKey)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Geographic reach */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-4 w-4" />
                    {t("impact.geoTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={geoData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="country" type="category" className="text-xs" width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Demographics */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-4 w-4" />
                    {t("impact.diversityTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={diversityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {diversityData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default ImpactDashboard;
