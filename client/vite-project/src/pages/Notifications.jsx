import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import { getNotifications, markNotificationsRead } from "../services/api";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchNotifications = async () => {
      try {
        const response = await getNotifications(token);
        setNotifications(response.data || []);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const markAllAsRead = async () => {
    const token = localStorage.getItem("authToken");

    try {
      await markNotificationsRead(token);
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, unread: false }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const markAsRead = (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#111111]">
      <Navbar />

      <main className="mx-auto mt-[50px] mb-20 w-[min(780px,calc(100%-40px))] max-[768px]:mt-[35px] max-[768px]:w-[min(680px,calc(100%-30px))] max-[600px]:mt-7 max-[600px]:mb-[50px] max-[600px]:w-[calc(100%-24px)]">
        <div className="mb-10 flex items-start justify-between max-[768px]:mb-[30px]">
          <div>
            <h1 className="m-0 font-[Georgia,'Times_New_Roman',serif] text-[32px] font-bold leading-[1.2] tracking-[-0.5px] max-[768px]:text-[29px] max-[600px]:text-[27px]">
              Notifications
            </h1>

            <p className="mt-2 mb-0 text-base text-[#8a8177] max-[600px]:text-sm">
              {unreadCount} unread
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="mt-[7px] border-none bg-transparent px-0 py-2 text-base font-medium text-[#123f30] hover:underline disabled:cursor-default disabled:opacity-[0.45] disabled:no-underline max-[600px]:text-sm"
          >
            Mark all read
          </button>
        </div>

        {loading && (
          <div className="rounded-[15px] border border-[#dedbd5] bg-white px-5 py-4 text-[#5a544d]">
            Loading notifications...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="rounded-[15px] border border-[#dedbd5] bg-white px-5 py-10 text-center text-[#5a544d]">
            No notifications yet.
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <section className="flex flex-col gap-[10px]">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                type={notification.type}
                articleName={notification.articleName}
                reason={notification.reason}
                time={notification.time}
                unread={notification.unread}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.type === "changes" && notification.articleId) {
                    navigate(`/author/articles/${notification.articleId}/edit`);
                  }
                }}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
