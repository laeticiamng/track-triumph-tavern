import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, MessageSquare } from "lucide-react";

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    const mailtoUrl = `mailto:contact@weeklymusicawards.com?subject=${encodeURIComponent(subject || "Contact WMA")}&body=${encodeURIComponent(`De: ${name} (${email})\n\n${message}`)}`;
    window.location.href = mailtoUrl;
    
    // Don't show "sent" toast — mailto opens email client, user sends manually
    toast({ title: t("contact.mailtoOpened"), description: t("contact.mailtoOpenedDesc") });
    setSending(false);
  };

  return (
    <Layout>
      <SEOHead
        title={t("contact.seoTitle")}
        description={t("contact.seoDesc")}
        url="/contact"
      />
      <div className="container max-w-2xl py-12">
        <div className="text-center mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">{t("contact.title")}</h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>

        <Card className="card-elevated border-gradient-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("contact.formTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.name")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("contact.namePlaceholder")}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("contact.emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t("contact.subject")}</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("contact.subjectPlaceholder")}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.message")}</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  rows={5}
                  required
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {sending ? "..." : t("contact.send")}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">{t("contact.directEmail")}</p>
              <a href="mailto:contact@weeklymusicawards.com" className="text-sm text-primary hover:underline">
                contact@weeklymusicawards.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
};

export default Contact;
