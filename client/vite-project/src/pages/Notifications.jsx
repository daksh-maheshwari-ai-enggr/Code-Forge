import { useState } from "react";
import Navbar from "../../components/Navbar";
import NotificationCard from "../../components/NotificationCard";

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
    <div className="min-h-screen bg-[#f8f5ef] text-[#111111]">
      <Navbar />

      <main
        className="
          w-[min(780px,calc(100%-40px))]
          mx-auto
          mt-[50px]
          mb-20

          max-[768px]:w-[min(680px,calc(100%-30px))]
          max-[768px]:mt-[35px]

          max-[600px]:w-[calc(100%-24px)]
          max-[600px]:mt-7
          max-[600px]:mb-[50px]
        "
      >
        <div
          className="
            flex
            justify-between
            items-start
            mb-10

            max-[768px]:mb-[30px]
          "
        >
          <div>
            <h1
              className="
                m-0
                font-[Georgia,'Times_New_Roman',serif]
                text-[32px]
                font-bold
                leading-[1.2]
                tracking-[-0.5px]

                max-[768px]:text-[29px]
                max-[600px]:text-[27px]
              "
            >
              Notifications
            </h1>

            <p
              className="
                mt-2
                mb-0
                text-[#8a8177]
                text-base

                max-[600px]:text-sm
              "
            >
              {unreadCount} unread
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="
              border-none
              bg-transparent
              text-[#123f30]
              text-base
              font-medium
              py-2
              px-0
              mt-[7px]
              cursor-pointer

              hover:underline

              disabled:opacity-[0.45]
              disabled:cursor-default
              disabled:no-underline

              max-[600px]:text-sm
            "
          >
            Mark all read
          </button>
        </div>

        <section className="flex flex-col gap-[10px]">
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
