import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// VAPID public key – generated once, pair stored server-side
const VAPID_PUBLIC_KEY = "BDummyKeyReplaceMeWithRealVAPIDPublicKey00000000000000000000000000000000000000000000000000";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  // Check existing subscription
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscription(sub);
      });
    });
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported || !user) return null;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return null;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    setSubscription(sub);

    // Store subscription in DB via edge function
    await supabase.functions.invoke("push-subscribe", {
      body: {
        subscription: sub.toJSON(),
      },
    });

    return sub;
  }, [supported, user]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    await subscription.unsubscribe();
    setSubscription(null);

    if (user) {
      await supabase.functions.invoke("push-unsubscribe", {
        body: {
          endpoint: subscription.endpoint,
        },
      });
    }
  }, [subscription, user]);

  return {
    supported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    subscribe,
    unsubscribe,
  };
}
