"use client";

import { useEffect, useState } from "react";
import { Bell, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ModulePage } from "@/components/shared/module-page";
import { useDebounce } from "@/hooks/use-debounce";

interface NotificationRow {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "low_stock" | "sale";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const typeVariants: Record<NotificationRow["type"], "secondary" | "destructive" | "success" | "warning"> = {
  info: "secondary",
  warning: "warning",
  success: "success",
  error: "destructive",
  low_stock: "warning",
  sale: "success",
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async (query = "") => {
    setIsLoading(true);
    try {
      const url = `/api/notifications${query ? `?search=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.items ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(debouncedSearch);
  }, [debouncedSearch]);

  const toggleRead = async (id: string, isRead: boolean) => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !isRead }),
    });
    const json = await res.json();
    if (json.success) {
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, isRead: !isRead } : notification
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setNotifications((current) => current.filter((item) => item._id !== id));
    }
  };

  return (
    <ModulePage title="Notifications" description="Low stock, sales alerts, and system notifications.">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Notification Center</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Review system alerts, sales updates, and inventory warnings in one place.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => loadNotifications(debouncedSearch)}>
              <Bell className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
                <th className="pb-3 pr-4 font-medium">Title</th>
                <th className="pb-3 pr-4 font-medium">Message</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification._id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4 font-medium">{notification.title}</td>
                  <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">{notification.message}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={typeVariants[notification.type]}>{notification.type.replace("_", " ")}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={notification.isRead ? "success" : "secondary"}>
                      {notification.isRead ? "Read" : "Unread"}
                    </Badge>
                  </td>
                  <td className="py-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRead(notification._id, notification.isRead)}
                    >
                      {notification.isRead ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(notification._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && notifications.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No notifications available. Check back later for system alerts.
            </p>
          )}
          {isLoading && (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading notifications...</p>
          )}
        </CardContent>
      </Card>
    </ModulePage>
  );
}
