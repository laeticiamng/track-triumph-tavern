import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema, type ResetValues } from "@/lib/auth-schemas";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onBack: () => void;
}

const AuthForgotPassword = ({ onBack }: Props) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ResetValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="font-display text-lg font-semibold">Email envoyé !</h3>
        <p className="text-sm text-muted-foreground">
          Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
          Vérifiez aussi vos spams.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <p className="text-sm text-muted-foreground">
        Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="vous@exemple.com" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AuthForgotPassword;
