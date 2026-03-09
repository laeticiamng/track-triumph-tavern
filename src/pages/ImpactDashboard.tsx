import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { BarChart3, Users, Globe, Accessibility, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const kpis = [
  { label: "Créateurs actifs", value: "2 430", change: "+18%", icon: Users },
  { label: "Primo-créateurs", value: "612", change: "+32%", icon: TrendingUp },
  { label: "Pays représentés", value: "19", change: "+3", icon: Globe },
  { label: "Artistes Inclusion", value: "184", change: "+45%", icon: Accessibility },
];

const geoData = [
  { country: "France", count: 580 },
  { country: "Allemagne", count: 340 },
  { country: "Espagne", count: 290 },
  { country: "Italie", count: 260 },
  { country: "Pologne", count: 180 },
  { country: "Pays-Bas", count: 150 },
  { country: "Belgique", count: 130 },
  { country: "Portugal", count: 110 },
];

const diversityData = [
  { name: "18-24 ans", value: 38, color: "hsl(var(--primary))" },
  { name: "25-34 ans", value: 32, color: "hsl(var(--chart-2))" },
  { name: "35-44 ans", value: 18, color: "hsl(var(--chart-3))" },
  { name: "45+ ans", value: 12, color: "hsl(var(--chart-4))" },
];

const ImpactDashboard = () => (
  <Layout>
    <SEOHead
      title="Impact Dashboard — Track Triumph"
      description="Métriques d'impact social : engagement communautaire, diversité géographique et démographique des participants."
      url="/impact"
    />

    <section className="py-20 md:py-28">
      <div className="container max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
            <BarChart3 className="h-3.5 w-3.5" />
            Impact Dashboard
          </span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl mb-4">
            Notre <span className="text-primary">impact</span> en chiffres
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Données agrégées pour nos partenaires institutionnels : collectivités, associations culturelles et fondations.
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{k.change}</span>
                    </div>
                    <p className="text-3xl font-bold">{k.value}</p>
                    <p className="text-sm text-muted-foreground">{k.label}</p>
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
                  Répartition géographique
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
                  Diversité démographique
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

export default ImpactDashboard;
