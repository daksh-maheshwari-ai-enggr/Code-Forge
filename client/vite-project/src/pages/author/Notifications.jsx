import { useState } from "react";
import Navbar from "../../components/Navbar";
import NotificationCard from "../../components/NotificationCard";
import "./Notifications.css";

// Dummy data for frontend
// Later articleName will come from backend/API
const initialNotifications = [
  {
    id: 1,
    type: "approved",
    articleName: "How CRISPR Is Rewriting the Story of Human Disease",
    time: "2 days ago",
    unread: true,
  },
  {
    id: 2,
    type: "changes",
    articleName: "The Forgotten History of the Mechanical Computer",
    time: "4 days ago",
    unread: true,
  },
  {
    id: 3,
    type: "rejected",
    articleName: "Urban Forests",
    time: "2 weeks ago",
    unread: false,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const markAsRead = (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  return (
    <div className="notifications-page">
      <Navbar />

      <main className="notifications-container">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>

            <p>{unreadCount} unread</p>
          </div>

          <button
            className="mark-all-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </div>

        <section className="notifications-list">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              type={notification.type}
              articleName={notification.articleName}
              time={notification.time}
              unread={notification.unread}
              onClick={() => markAsRead(notification.id)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}