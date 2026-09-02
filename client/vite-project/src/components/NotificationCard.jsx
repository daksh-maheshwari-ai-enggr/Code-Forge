function NotificationIcon({ type }) {
  if (type === "approved") {
    return (
      <div className="w-10 h-10 min-w-10 flex items-center justify-center rounded-full bg-[#e3e1db] mt-px text-[#00aa83]">
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
      <div className="w-10 h-10 min-w-10 flex items-center justify-center rounded-full bg-[#e3e1db] mt-px text-[#f28b00]">
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
    <div className="w-10 h-10 min-w-10 flex items-center justify-center rounded-full bg-[#e3e1db] mt-px text-[#ff2929]">
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
      onClick={onClick}
      className={`
        relative flex items-start gap-5
        min-h-[88px] px-5 py-[22px]
        bg-white border border-[#dedbd5] rounded-[15px]
        cursor-pointer
        transition-[background-color,border-color,transform]
        duration-200 ease-in-out
        hover:border-[#c9c5bd] hover:-translate-y-px

        ${unread ? "bg-[#eeece6] border-[#ccc9c1]" : ""}

        max-[768px]:px-[17px]
        max-[768px]:py-5
        max-[768px]:gap-4

        max-[600px]:min-h-0
        max-[600px]:px-[15px]
        max-[600px]:py-[17px]
        max-[600px]:gap-[13px]
        max-[600px]:rounded-[13px]
      `}
    >
      <div className="max-[600px]:w-9 max-[600px]:h-9 max-[600px]:min-w-9">
        <NotificationIcon type={type} />
      </div>

      <div className="flex-1 pr-[15px]">
        <p
          className="
            m-0
            font-[Arial,Helvetica,sans-serif]
            text-[17px]
            leading-[1.55]
            text-[#111111]

            max-[768px]:text-base
            max-[600px]:text-[15px]
            max-[600px]:leading-[1.45]
          "
        >
          {getMessage()}
        </p>

        <span
          className="
            block mt-[7px]
            text-[#817970]
            font-['Courier_New',monospace]
            text-sm
            tracking-[0.3px]

            max-[600px]:text-xs
          "
        >
          {time}
        </span>
      </div>

      {unread && (
        <span
          className="
            absolute top-[30px] right-5
            w-[10px] h-[10px]
            rounded-full
            bg-[#c9823d]

            max-[600px]:w-2
            max-[600px]:h-2
            max-[600px]:top-[27px]
            max-[600px]:right-[15px]
          "
        />
      )}
    </div>
  );
}
```
