import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { AIChatbot } from "@/components/ai/AIChatbot";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 md:pb-0">{children}</main>
      <BottomNav />
      <AIChatbot />
    </div>
  );
}
