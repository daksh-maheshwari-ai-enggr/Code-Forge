import "./NotificationCard.css";

function NotificationIcon({ type }) {
  if (type === "approved") {
    return (
      <div className="notification-icon approved-icon">
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      </div>
    );
  }

  if (type === "changes") {
    return (
      <div className="notification-icon changes-icon">
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="notification-icon rejected-icon">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </svg>
    </div>
  );
}

export default function NotificationCard({
  type,
  articleName,
  time,
  unread,
  onClick,
}) {
  const getMessage = () => {
    switch (type) {
      case "approved":
        return (
          <>
            Your article <strong>"{articleName}"</strong> has been approved
            and published.
          </>
        );

      case "changes":
        return (
          <>
            Admin has requested changes to{" "}
            <strong>"{articleName}"</strong>.
          </>
        );

      case "rejected":
        return (
          <>
            Your article <strong>"{articleName}"</strong> has been rejected.
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`notification-card ${unread ? "unread" : ""}`}
      onClick={onClick}
    >
      <NotificationIcon type={type} />

      <div className="notification-content">
        <p className="notification-message">{getMessage()}</p>

        <span className="notification-time">{time}</span>
      </div>

      {unread && <span className="unread-dot" />}
    </div>
  );
}