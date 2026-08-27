/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle, Check, ExternalLink } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "URGENT";
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "YİBF 14582 için 2 yeni eksiklik",
      message: "Kolon C12 ve Kiriş K5'te uygunsuzluk tespit edildi.",
      type: "URGENT",
      isRead: false,
      link: "/inspection/yibf/14582",
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      title: "Kontrol Gecikmesi Uyarısı",
      message: "3 yapıda planlanan kontrol zamanı aşıldı.",
      type: "WARNING",
      isRead: false,
      link: "/inspection/dispatch",
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: "3",
      title: "PDF Rapor Oluşturuldu",
      message: "Ağustos ayı yönetim raporu başarıyla oluşturuldu.",
      type: "SUCCESS",
      isRead: true,
      link: "/inspection/reports",
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: "4",
      title: "Yeni Görev Atandı",
      message: "Bugün için 5 yeni denetim görevi atandı.",
      type: "INFO",
      isRead: true,
      link: "/inspection/dispatch",
      createdAt: new Date(Date.now() - 172800000),
    },
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "URGENT":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "ERROR":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "URGENT":
      case "ERROR":
        return "border-red-700 bg-red-900/20";
      case "WARNING":
        return "border-orange-700 bg-orange-900/20";
      case "SUCCESS":
        return "border-green-700 bg-green-900/20";
      default:
        return "border-blue-700 bg-blue-900/20";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed right-4 top-16 w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Bildirimler</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Bildirim bulunmuyor</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-slate-800/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                            >
                              <Check className="w-3 h-3 text-slate-400" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">{formatTime(notification.createdAt)}</span>
                          {notification.link && (
                            <div className="flex items-center gap-1 text-xs text-blue-400">
                              <ExternalLink className="w-3 h-3" />
                              <span>Görüntüle</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800">
            <button className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              Tüm Bildirimleri Gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
