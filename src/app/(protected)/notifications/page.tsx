
"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, CheckCircle, Circle, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  createdAt?: string;
  isRead: boolean;
  type?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  expiresAt?: string;
}

export default function NotificationsPage() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:5006"}/api/notifications`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const validNotifications = (data.notifications || data).filter(
          (n: Notification) => !n.expiresAt || new Date(n.expiresAt) >= new Date()
        );
        setNotifications(validNotifications);
      })
      .catch((error) => {
        console.error("Failed to fetch notifications:", error);
        toast.error("Failed to load notifications.");
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (!user?.tenantId || !token) return;

    const notificationServiceUrl =
      process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:5006";
    const socket = io(`${notificationServiceUrl}/notifications`, {
      query: { tenantId: user.tenantId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token: `Bearer ${token}` },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected");
      socket.emit("join", { tenantId: user.tenantId, userId: user.id });
    });

    socket.on("notificationCreated", (notification: Notification) => {
      console.log("Received notification:", notification);
      if (notification.expiresAt && new Date(notification.expiresAt) < new Date()) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [
          notification,
          ...prev.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          ),
        ];
      });
      if (!notification.isRead) {
        toast(notification.title, {
          description: notification.message,
          action: notification.link && {
            label: "View",
            onClick: () => { if (notification.link) window.location.href = notification.link; },
          },
        });
      }
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      toast.error("Failed to connect to notifications.");
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    socket.on("reconnect", (attempt) => {
      console.log("WebSocket reconnected after attempt:", attempt);
      socket.emit("join", { tenantId: user.tenantId, userId: user.id });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.tenantId, user?.id, token]);

  // User actions
  const markAsRead = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:5006"}/api/notifications/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationIds: [id] }),
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success("Notification marked as read.");
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark notification as read.");
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:5006"}/api/notifications/unread`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationIds: [id] }),
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      toast.success("Notification marked as unread.");
    } catch (error) {
      console.error("Failed to mark as unread:", error);
      toast.error("Failed to mark notification as unread.");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:5006"}/api/notifications/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationIds: [id] }),
        }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted.");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification.");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:5006"}/api/notifications/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationIds: notifications.map((n) => n.id),
          }),
        }
      );
      setNotifications([]);
      toast.success("All notifications deleted.");
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      toast.error("Failed to delete notifications.");
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "read") return n.isRead;
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark dark:text-white">
          Notifications
        </h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {filter === "all"
                  ? "All"
                  : filter === "read"
                    ? "Read"
                    : "Unread"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("read")}>
                Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>
                Unread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {notifications.length > 0 && (
            <Button
              variant="destructive"
              onClick={deleteAllNotifications}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {filter === "all"
            ? "No notifications."
            : `No ${filter} notifications.`}
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredNotifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                n.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-200",
                n.priority === "HIGH" &&
                  !n.isRead &&
                  "border-l-4 border-red-500"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-lg font-semibold text-dark dark:text-white">
                      {n.title}
                    </strong>
                    {n.type && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {n.type}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {n.message}
                  </p>
                  {n.createdAt && (
                    <span className="block text-xs text-gray-400 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  )}
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-primary underline text-sm mt-2 inline-block"
                    >
                      View Details
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      n.isRead ? markAsUnread(n.id) : markAsRead(n.id)
                    }
                    title={n.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {n.isRead ? (
                      <Circle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNotification(n.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
