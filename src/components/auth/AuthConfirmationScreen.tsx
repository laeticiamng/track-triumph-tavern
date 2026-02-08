import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  email: string;
  onBack: () => void;
}

const AuthConfirmationScreen = ({ email, onBack }: Props) => {
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Email renvoyé", description: "Vérifiez votre boîte de réception." });
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
      <h3 className="font-display text-lg font-semibold">Inscription réussie !</h3>
      <p className="text-sm text-muted-foreground">
        Un email de confirmation a été envoyé à <strong>{email}</strong>.
        Vérifiez votre boîte de réception (et vos spams).
      </p>
      <div className="flex flex-col gap-2 pt-2">
        <Button variant="outline" onClick={handleResend} disabled={resending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${resending ? "animate-spin" : ""}`} />
          Renvoyer l'email
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Retour à la connexion
        </Button>
      </div>
    </div>
  );
};

export default AuthConfirmationScreen;
