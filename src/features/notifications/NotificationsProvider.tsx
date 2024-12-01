"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface NotificationContextValue {
  showNotification: (text: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>(0 as never);

interface NotificationItem {
  id: number;
  text: string;
}

let genId = 0;

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = (text: string) => {
    const id = ++genId;

    setNotifications((prev) => [
      ...prev,
      {
        id,
        text: text,
      },
    ]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {notifications.length ? (
        <div className="toast">
          {notifications.map((notif) => (
            <div key={notif.id} className="alert">
              <span>{notif.text}</span>
            </div>
          ))}
        </div>
      ) : null}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  return useContext(NotificationContext);
}
