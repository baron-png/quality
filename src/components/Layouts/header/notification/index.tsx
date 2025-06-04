"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BellIcon } from "./icons";
import { io, Socket } from "socket.io-client";
import { debounce } from "lodash";

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  createdAt?: string;
  isRead: boolean;
}

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const hasFetched = useRef(false);
  const isMobile = useIsMobile();

  // Compute unread notifications for indication
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  // Debounce dropdown open/close
  const debouncedHandleOpenChange = useRef(
    debounce((open: boolean) => {
      setIsOpen(open);
      if (open) {
        // Mark notifications as read when opening dropdown (optional)
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
      }
    }, 300)
  ).current;

  const handleOpenChange = (open: boolean) => {
    debouncedHandleOpenChange(open);
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (!user?.tenantId || !token) return;

    const notificationServiceUrl = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL;
    if (!notificationServiceUrl) {
      console.error("NEXT_PUBLIC_NOTIFICATION_SERVICE_URL is not defined");
      return;
    }

    const socket = io(notificationServiceUrl, {
      query: { tenantId: user.tenantId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token }, // Include token for authentication
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected");
      socket.emit("join", { tenantId: user.tenantId });
    });

    socket.on("notificationCreated", (notification: Notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    socket.on("reconnect", (attempt) => {
      console.log("WebSocket reconnected after attempt:", attempt);
      socket.emit("join", { tenantId: user.tenantId });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.tenantId, token]);

  // Fetch initial notifications on mount
  useEffect(() => {
    if (!token || hasFetched.current) return;

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || data);
        hasFetched.current = true;
      })
      .catch((error) => {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Mark notifications as read on server when dropdown is opened (optional)
  useEffect(() => {
    if (isOpen && token && notifications.some((n) => !n.isRead)) {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL}/api/notifications/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds: unreadIds }),
      })
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true }))
          );
        })
        .catch((error) => console.error("Failed to mark notifications as read:", error));
    }
  }, [isOpen, token, notifications]);

  return (
    <Dropdown isOpen={isOpen} setIsOpen={handleOpenChange}>
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />
          {hasUnread && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3"
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent>
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
            {unreadCount} new
          </span>
        </div>
        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {loading ? (
            <li className="text-center text-gray-500">Loading...</li>
          ) : notifications.length === 0 ? (
            <li className="text-center text-gray-500">No notifications</li>
          ) : (
            notifications.map((item) => (
              <li key={item.id} role="menuitem">
                <Link
                  href={item.link || "#"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
                >
                  <div>
                    <strong className="block text-sm font-medium text-dark dark:text-white">
                      {item.title}
                    </strong>
                    <span className="truncate text-sm font-medium text-dark-5 dark:text-dark-6">
                      {item.message}
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
        <Link
          href="/notifications"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          See all notifications
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}