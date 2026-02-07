import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";

interface ShareSheetProps {
  title: string;
  artistName: string;
  submissionId: string;
}

export function ShareSheet({ title, artistName, submissionId }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/submissions/${submissionId}`;
  const text = `🎵 Écoute "${title}" par ${artistName}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const links = [
    {
      label: "Twitter / X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          onClick={async (e) => {
            const shared = await handleNativeShare();
            if (shared) e.preventDefault();
          }}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Share2 className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">Partager</span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Partager</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-3">
          <Button variant="outline" className="w-full justify-start gap-3" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Lien copié !" : "Copier le lien"}
          </Button>
          {links.map((l) => (
            <Button key={l.label} variant="outline" className="w-full justify-start gap-3" asChild>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {l.label}
              </a>
            </Button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
