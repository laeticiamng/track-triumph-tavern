import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { AIChatbot } from "@/components/ai/AIChatbot";
import { useSubscription } from "@/hooks/use-subscription";

export function Layout({ children }: { children: React.ReactNode }) {
  const { tier } = useSubscription();
  const showChatbot = tier === "pro" || tier === "elite";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 md:pb-0">{children}</main>
      <BottomNav />
      {showChatbot && <AIChatbot />}
    </div>
  );
}
