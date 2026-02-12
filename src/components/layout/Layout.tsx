import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { AIChatbot } from "@/components/ai/AIChatbot";
import { useSubscription } from "@/hooks/use-subscription";

export function Layout({ children }: { children: React.ReactNode }) {
  const { tier } = useSubscription();
  const showChatbot = tier === "pro" || tier === "elite";

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:top-2 focus:left-2">
        Aller au contenu principal
      </a>
      <Header />
      <main id="main-content" className="pt-16 pb-20 md:pb-0">{children}</main>
      <BottomNav />
      {showChatbot && <AIChatbot />}
    </div>
  );
}
