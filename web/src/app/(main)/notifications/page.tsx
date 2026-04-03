"use client";

import React, { useEffect, useState } from "react";
import { Bell, X, EllipsisVertical, BellOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/EmptyState";
import { TopLoader } from "@/components/ui/TopLoader";

import { fetchNotifications } from "@/store/features/notifications/thunks/fetch-notifications.thunk";
import { fetchUnreadCount } from "@/store/features/notifications/thunks/fetch-unread-count.thunk";
import { deleteNotification } from "@/store/features/notifications/thunks/delete-notification.thunk";
import { markAllNotificationsAsRead } from "@/store/features/notifications/thunks/mark-all-as-read.thunk";
import {
  INotification,
  INotificationMeta,
  NOTIFICATION_TYPE_CONFIG,
  NOTIFICATION_FILTER_LABELS,
} from "@/store/features/notifications/notification.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatRelativeDate } from "@/utils/date.utils";
import { toast } from "sonner";

interface Filter {
  id: string;
  label: string;
}

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, meta, unreadCount, isLoading, error } = useAppSelector(
    (state) => state.notification,
  );

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }))
      .then(() => {
        dispatch(fetchUnreadCount());
      })
      .catch(() => {
        toast.error("Failed to load notifications. Please try again.");
      });
  }, [dispatch]);

  const [activeFilter, setActiveFilter] = useState("all");

  // Demo Data - Easy to replace with API
  const filters: Filter[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    ...Object.entries(NOTIFICATION_FILTER_LABELS).map(([id, label]) => ({
      id,
      label,
    })),
  ];

  // Apply active filter to notifications list
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.isRead;
    return n.type === activeFilter;
  });

  // Group notifications by date (e.g. Today, Yesterday, Mar 25, 2026)
  const groupedNotifications = filteredNotifications.reduce(
    (grouped, notification) => {
      // Convert createdAt → readable date label
      // e.g. "Today", "Yesterday", "Mar 25, 2026"
      const dateKey = formatRelativeDate(notification.createdAt, {
        showTime: false,
        showYear: true,
        relativeDaysLimit: 3,
      });

      // If this date group does not exist yet,
      // create an empty array for it
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      // Push current notification into its corresponding date group
      grouped[dateKey].push(notification);

      // Return updated grouped simulator for next iteration
      return grouped;
    },

    // Initial value: empty object
    // Structure should: { [date: string]: INotification[] }
    {} as Record<string, INotification[]>,
  );

  const markAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead())
      .unwrap()
      .then(() => {
        toast.success("All notifications marked as read");
      })
      .catch((error) => {
        toast.error("Failed to mark all as read. Please try again.", {
          description: error.message,
        });
      });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
        <div className="px-4 lg:px-8 pt-4 pb-4">
          <div className="flex items-center gap-3 mx-auto">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Bell className="size-5.5" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate">
                Notifications
              </h1>
              <p className="text-slate-500 text-xs truncate">
                You have {notifications.filter((n) => !n.isRead).length} new
                notifications
              </p>
            </div>

            {notifications.length > 0 &&
              notifications.some((n) => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-semibold text-primary hover:underline transition-colors whitespace-nowrap cursor-pointer"
                >
                  Mark all read
                </button>
              )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 lg:px-8 pb-4">
          <div className="mx-auto flex gap-2 overflow-x-auto no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter.id
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-slate-200 text-slate-600 border border-transparent hover:border-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto flex flex-col pb-24 lg:pb-8">
        <div className="flex-1 relative flex flex-col mx-auto w-full px-4 lg:px-8 py-6">
          {/* Loading state */}
          <TopLoader isLoading={isLoading} />
          
          {/* Empty State when no notifications to show for the active filter */}
          {filteredNotifications.length === 0 && !isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={BellOff}
                title="No Notifications"
                description="You're all caught up! Check back later for new notifications."
              />
            </div>
          ) : (
            <main className="space-y-8">
              {Object.entries(groupedNotifications).map(
                ([dateKey, dateNotifications]) => (
                  <section key={dateKey}>
                    {/* Section Header */}
                    <div className="mb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {dateKey}
                      </h2>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-1">
                      {dateNotifications.map((notification) => {
                        const config =
                          NOTIFICATION_TYPE_CONFIG[notification.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={notification._id}
                            className={`relative group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${
                              !notification.isRead
                                ? "bg-blue-50 border-primary"
                                : "bg-white border-transparent"
                            }`}
                          >
                            {/* Unread Indicator Dot */}
                            {!notification.isRead && (
                              <div className="absolute top-1.5 right-5 h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                            )}
                            {/* Icon or Avatar */}
                            <div
                              className={`shrink-0 w-10 md:w-11 h-10 md:h-11 rounded-lg ${config.iconBg} flex items-center justify-center ${config.iconColor}`}
                            >
                              <Icon size={22} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 mr-10">
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="text-sm font-bold leading-tight">
                                  {notification.title}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {notification.message}
                              </p>
                              <span className="text-[11px] font-medium text-slate-400 mt-1 block capitalize">
                                {notification.createdAt
                                  ? formatRelativeDate(notification.createdAt, {
                                      showTime: true,
                                      showYear: false,
                                    })
                                  : ""}
                              </span>
                            </div>
                            {/* Individual Dropdown Action */}
                            <div className="absolute top-1/2 right-3.5 -translate-y-1/2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 hover:bg-slate-200 rounded-md transition-colors outline-none cursor-pointer opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100">
                                    <EllipsisVertical className="size-4 text-slate-500" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-32 shadow border border-slate-100"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      dispatch(
                                        deleteNotification(notification._id),
                                      )
                                        .unwrap()
                                        .then(() => {
                                          toast.success("Notification deleted");
                                        })
                                        .catch((error) => {
                                          toast.error(
                                            "Failed to delete notification. Please try again.",
                                            { description: error.message },
                                          );
                                        });
                                    }}
                                    className="text-slate-600 cursor-pointer py-2"
                                  >
                                    <X
                                      strokeWidth={2.5}
                                      className="mr-2 size-4 text-slate-600"
                                    />
                                    <span className="font-medium">Clear</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ),
              )}
            </main>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
