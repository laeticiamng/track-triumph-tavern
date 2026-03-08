import { useState, useRef, useEffect } from "react";
import { Bell, Heart, Trophy, Calendar, Check, CheckCheck, BellRing, BellOff } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, de } from "date-fns/locale";

const ICON_MAP: Record<string, typeof Heart> = {
  vote_received: Heart,
  results_published: Trophy,
  new_week: Calendar,
};

const ROUTE_MAP: Record<string, (meta: Record<string, unknown>) => string> = {
  vote_received: (meta) => `/submissions/${meta.submission_id}`,
  results_published: () => "/results",
  new_week: () => "/vote",
};

const LOCALE_MAP: Record<string, typeof fr> = { fr, en: enUS, de };

function NotificationItem({
  notification,
  onRead,
  onClick,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onClick: (n: Notification) => void;
}) {
  const { i18n } = useTranslation();
  const Icon = ICON_MAP[notification.type] || Bell;
  const isUnread = !notification.read_at;
  const locale = LOCALE_MAP[i18n.language] || enUS;

  return (
    <button
      onClick={() => {
        if (isUnread) onRead(notification.id);
        onClick(notification);
      }}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
        isUnread ? "bg-primary/5" : ""
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm truncate ${isUnread ? "font-semibold" : "font-medium"}`}>
            {notification.title}
          </p>
          {isUnread && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.body}</p>
        )}
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale })}
        </p>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const { supported: pushSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNotificationClick = (n: Notification) => {
    const routeFn = ROUTE_MAP[n.type];
    const meta = (n.metadata as Record<string, unknown>) || {};
    if (routeFn) {
      navigate(routeFn(meta));
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t("notifications.bell", "Notifications")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
      >
        <Bell className="h-4 w-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-hidden rounded-xl border border-border bg-card shadow-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">{t("notifications.title", "Notifications")}</h3>
              <div className="flex items-center gap-2">
                {pushSupported && (
                  <button
                    onClick={() => isSubscribed ? unsubscribe() : subscribe()}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      isSubscribed ? "text-primary hover:text-destructive" : "text-muted-foreground hover:text-primary"
                    }`}
                    title={isSubscribed ? t("notifications.disablePush", "Désactiver push") : t("notifications.enablePush", "Activer push")}
                  >
                    {isSubscribed ? <BellOff className="h-3.5 w-3.5" /> : <BellRing className="h-3.5 w-3.5" />}
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    {t("notifications.markAllRead", "Tout marquer comme lu")}
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[350px] divide-y divide-border">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">{t("notifications.empty", "Aucune notification")}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markAsRead}
                    onClick={handleNotificationClick}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
