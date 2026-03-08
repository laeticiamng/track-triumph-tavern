import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props { email: string; onBack: () => void; }

const AuthConfirmationScreen = ({ email, onBack }: Props) => {
  const [resending, setResending] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) { toast({ title: t("errors.error"), description: error.message, variant: "destructive" }); }
      else { toast({ title: t("auth.emailResent"), description: t("auth.emailResentDesc") }); }
    } finally { setResending(false); }
  };

  return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
      <h3 className="font-display text-lg font-semibold">{t("auth.signupSuccess")}</h3>
      <p className="text-sm text-muted-foreground">
        {t("auth.confirmEmailDesc", { email })}
      </p>
      <div className="flex flex-col gap-2 pt-2">
        <Button variant="outline" onClick={handleResend} disabled={resending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${resending ? "animate-spin" : ""}`} />
          {t("auth.resendEmail")}
        </Button>
        <Button variant="ghost" onClick={onBack}>{t("auth.backToLogin")}</Button>
      </div>
    </div>
  );
};

export default AuthConfirmationScreen;
