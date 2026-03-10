import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/auth-schemas";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Mail, Lock } from "lucide-react";

interface AuthLoginFormProps {
  onSubmit: (values: LoginValues) => Promise<void>;
  loading: boolean;
  onForgotPassword: () => void;
}

const AuthLoginForm = ({ onSubmit, loading, onForgotPassword }: AuthLoginFormProps) => {
  const { t } = useTranslation();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("auth.email")}</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder={t("auth.emailPlaceholder")} className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("auth.password")}</FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder={t("auth.passwordPlaceholder")} className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
            <button type="button" onClick={onForgotPassword} className="text-xs text-muted-foreground hover:text-primary transition-colors py-1.5 min-h-[2.75rem] inline-flex items-center">
              {t("auth.forgotPassword")}
            </button>
          </FormItem>
        )} />
        <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" disabled={loading}>
          {loading ? t("auth.loading") : t("auth.loginButton")}
        </Button>
      </form>
    </Form>
  );
};

export default AuthLoginForm;
