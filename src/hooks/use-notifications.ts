import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// Shared singleton state to prevent duplicate fetches across multiple hook instances
let sharedNotifications: Notification[] = [];
let sharedUnreadCount = 0;
let sharedLoading = true;
let lastFetchTime = 0;
let fetchPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let realtimeUserId: string | null = null;

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

export function useNotifications() {
  const { user } = useAuth();
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  // Subscribe to shared state changes
  useEffect(() => {
    subscribers.add(rerender);
    return () => {
      subscribers.delete(rerender);
    };
  }, [rerender]);

  // Fetch notifications (with dedup via staleTime)
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      sharedNotifications = [];
      sharedUnreadCount = 0;
      sharedLoading = false;
      notifySubscribers();
      return;
    }

    // Dedup: skip if fetched less than 5s ago
    const now = Date.now();
    if (now - lastFetchTime < 5_000) {
      sharedLoading = false;
      notifySubscribers();
      return;
    }

    // Dedup: reuse in-flight request
    if (fetchPromise) return fetchPromise;

    fetchPromise = (async () => {
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (data) {
          const items = data as unknown as Notification[];
          sharedNotifications = items;
          sharedUnreadCount = items.filter((n) => !n.read_at).length;
        }
        lastFetchTime = Date.now();
      } finally {
        sharedLoading = false;
        fetchPromise = null;
        notifySubscribers();
      }
    })();

    return fetchPromise;
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription (singleton - only one channel regardless of hook instances)
  useEffect(() => {
    if (!user) {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
        realtimeUserId = null;
      }
      return;
    }

    // Already subscribed for this user
    if (realtimeUserId === user.id && realtimeChannel) return;

    // Clean up old channel
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    realtimeUserId = user.id;
    realtimeChannel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as unknown as Notification;
          sharedNotifications = [newNotif, ...sharedNotifications].slice(0, 50);
          sharedUnreadCount += 1;
          notifySubscribers();
        }
      )
      .subscribe();

    return () => {
      // Only clean up if this is the last subscriber
      if (subscribers.size <= 1 && realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
        realtimeUserId = null;
      }
    };
  }, [user]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      sharedNotifications = sharedNotifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      );
      sharedUnreadCount = Math.max(0, sharedUnreadCount - 1);
      notifySubscribers();
    },
    [user]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    sharedNotifications = sharedNotifications.map((n) => ({
      ...n,
      read_at: n.read_at || new Date().toISOString(),
    }));
    sharedUnreadCount = 0;
    notifySubscribers();
  }, [user]);

  return {
    notifications: sharedNotifications,
    unreadCount: sharedUnreadCount,
    loading: sharedLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
