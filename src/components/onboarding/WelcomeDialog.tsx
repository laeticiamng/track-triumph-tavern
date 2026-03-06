import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Music, Vote, Trophy } from "lucide-react";

const ONBOARDING_KEY = "wma-onboarding-seen";

interface WelcomeDialogProps {
  userId: string;
}

const WelcomeDialog = ({ userId }: WelcomeDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, [userId]);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const goToExplore = () => {
    dismiss();
    navigate("/explore");
  };

  const goToVote = () => {
    dismiss();
    navigate("/vote");
  };

  const steps = [
    { icon: <Music className="h-6 w-6 text-primary" />, title: t("onboarding.step1Title"), desc: t("onboarding.step1Desc") },
    { icon: <Vote className="h-6 w-6 text-primary" />, title: t("onboarding.step2Title"), desc: t("onboarding.step2Desc") },
    { icon: <Trophy className="h-6 w-6 text-amber-500" />, title: t("onboarding.step3Title"), desc: t("onboarding.step3Desc") },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            {t("onboarding.welcomeTitle")} 🎶
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("onboarding.welcomeDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                {step.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={goToVote} className="w-full bg-gradient-primary hover:opacity-90">
            {t("onboarding.startVoting")}
          </Button>
          <Button variant="outline" onClick={goToExplore} className="w-full">
            {t("onboarding.exploreTracks")}
          </Button>
          <Button variant="ghost" onClick={dismiss} className="w-full text-muted-foreground">
            {t("onboarding.later")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
