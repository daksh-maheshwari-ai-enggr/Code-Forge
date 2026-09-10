import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck,
  FiMessageCircle,
  FiSearch,
  FiSend,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  createChatSocket,
  getChatMessages,
  getChatUsers,
  sendChatMessage,
} from "../services/chat";

export default function Chat() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const localMessageIdsRef = useRef(new Set());

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ---------------------------------------------------------
  // LOAD USERS
  // ---------------------------------------------------------
  useEffect(() => {
    if (!token || !user) {
      setLoadingUsers(false);
      return;
    }

    let mounted = true;

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError("");

        const data = await getChatUsers(token);

        if (!mounted) return;

        setUsers(data);

        if (data.length > 0) {
          setSelectedUser((current) => current || data[0]);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load users");
        }
      } finally {
        if (mounted) {
          setLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [token, user]);

  // ---------------------------------------------------------
  // SOCKET CONNECTION
  // ---------------------------------------------------------
  useEffect(() => {
    if (!token || !user) return;

    const socket = createChatSocket(token);
    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      setError(err.message || "Chat connection failed");
    });

    socket.on("new_message", (message) => {
      const currentUser = selectedUserRef.current;

      if (!currentUser) return;

      const senderId = message.sender?._id
        ? String(message.sender._id)
        : String(message.sender);

      const receiverId = message.receiver?._id
        ? String(message.receiver._id)
        : String(message.receiver);

      const currentConversationUserId = String(currentUser._id);
      const loggedInUserId = String(user._id);

      const belongsToCurrentConversation =
        (senderId === currentConversationUserId &&
          receiverId === loggedInUserId) ||
        (senderId === loggedInUserId &&
          receiverId === currentConversationUserId);

      if (!belongsToCurrentConversation) return;

      setMessages((current) => {
        const exists = current.some(
          (item) => String(item._id) === String(message._id),
        );

        if (exists) return current;

        return [...current, message];
      });
    });

    socket.on("message_sent", (message) => {
      const currentUser = selectedUserRef.current;

      if (!currentUser) return;

      const receiverId = message.receiver?._id
        ? String(message.receiver._id)
        : String(message.receiver);

      if (receiverId !== String(currentUser._id)) return;

      localMessageIdsRef.current.add(String(message._id));

      setMessages((current) => {
        const exists = current.some(
          (item) => String(item._id) === String(message._id),
        );

        if (exists) return current;

        return [...current, message];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  // ---------------------------------------------------------
  // LOAD CONVERSATION
  // ---------------------------------------------------------
  useEffect(() => {
    if (!selectedUser || !token) {
      setMessages([]);
      return;
    }

    let mounted = true;

    const selectedUserId = String(selectedUser._id);
    const loggedInUserId = String(user._id);

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");

        const data = await getChatMessages(
          token,
          selectedUser._id,
        );

        if (!mounted) return;

        const fetchedMessages = data.messages || [];

        setMessages((currentMessages) => {
          const currentConversationMessages =
            currentMessages.filter((message) => {
              const senderId = message.sender?._id
                ? String(message.sender._id)
                : String(message.sender);

              const receiverId = message.receiver?._id
                ? String(message.receiver._id)
                : String(message.receiver);

              return (
                (senderId === loggedInUserId &&
                  receiverId === selectedUserId) ||
                (senderId === selectedUserId &&
                  receiverId === loggedInUserId)
              );
            });

          const fetchedIds = new Set(
            fetchedMessages.map((message) =>
              String(message._id),
            ),
          );

          const stillLocalMessages =
            currentConversationMessages.filter(
              (message) =>
                localMessageIdsRef.current.has(
                  String(message._id),
                ) &&
                !fetchedIds.has(String(message._id)),
            );

          const merged = [
            ...fetchedMessages,
            ...stillLocalMessages,
          ];

          const uniqueMessages = Array.from(
            new Map(
              merged.map((message) => [
                String(message._id),
                message,
              ]),
            ).values(),
          );

          uniqueMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );

          return uniqueMessages;
        });
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load messages");
          setMessages([]);
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [selectedUser, token, user]);

  // ---------------------------------------------------------
  // AUTO SCROLL
  // ---------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ---------------------------------------------------------
  // FILTER USERS
  // ---------------------------------------------------------
  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter(
      (item) =>
        item.name?.toLowerCase().includes(value) ||
        item.email?.toLowerCase().includes(value),
    );
  }, [users, search]);

  // ---------------------------------------------------------
  // TIME FORMAT
  // ---------------------------------------------------------
  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---------------------------------------------------------
  // SEND MESSAGE
  // ---------------------------------------------------------
  const handleSendMessage = async (event) => {
    event?.preventDefault();

    const content = messageText.trim();

    if (
      !content ||
      !selectedUser ||
      !socketRef.current ||
      !socketRef.current.connected
    ) {
      return;
    }

    try {
      setError("");

      const sentMessage = await sendChatMessage(
        socketRef.current,
        selectedUser._id,
        content,
      );

      localMessageIdsRef.current.add(
        String(sentMessage._id),
      );

      setMessages((current) => {
        const exists = current.some(
          (item) =>
            String(item._id) === String(sentMessage._id),
        );

        if (exists) return current;

        return [...current, sentMessage];
      });

      setMessageText("");
    } catch (err) {
      setError(err.message || "Unable to send message");
    }
  };

  // ---------------------------------------------------------
  // LOGGED OUT
  // ---------------------------------------------------------
  if (!user) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[calc(100vh-69px)] items-center justify-center bg-[#FBF8F3] px-6">
          <div className="text-center">
            <FiMessageCircle className="mx-auto h-12 w-12 text-[#1B3B2B]" />

            <h1 className="mt-5 font-serif text-3xl font-bold text-stone-900">
              Login to use Chat
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Sign in to start conversations with other users.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-69px)] bg-[#FBF8F3] px-4 py-6 md:px-6">
        <div className="mx-auto flex h-[calc(100vh-117px)] max-w-7xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

          {/* SIDEBAR */}
          <aside className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-stone-200 bg-[#FCFAF6]">
            <div className="border-b border-stone-200 p-5">
              <h1 className="font-serif text-2xl font-bold text-[#171411]">
                Messages
              </h1>

              <div className="relative mt-4">
                <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search people..."
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#1B3B2B]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingUsers ? (
                <div className="p-5 text-sm text-stone-400">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-5 text-center text-sm text-stone-400">
                  No users found.
                </div>
              ) : (
                filteredUsers.map((item) => {
                  const active =
                    String(selectedUser?._id) ===
                    String(item._id);

                  const initials =
                    item.name
                      ?.split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "U";

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        localMessageIdsRef.current.clear();
                        setSelectedUser(item);
                        setMessages([]);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                        active
                          ? "bg-[#EAF0EB]"
                          : "hover:bg-[#F1EDE5]"
                      }`}
                    >
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1B3B2B] text-sm font-semibold text-[#D8E6DC]">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {item.name}
                        </p>

                        <p className="truncate text-xs text-stone-400">
                          {item.role}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* CHAT */}
          <section className="flex min-w-0 flex-1 flex-col">
            {selectedUser ? (
              <>
                {/* HEADER */}
                <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-6 py-4">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B3B2B] text-xs font-semibold text-[#D8E6DC]">
                      {selectedUser.name
                        ?.split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900">
                      {selectedUser.name}
                    </h2>

                    <p className="text-xs text-stone-400">
                      {selectedUser.role}
                    </p>
                  </div>
                </header>

                {/* ERROR */}
                {error && (
                  <div className="border-b border-red-100 bg-red-50 px-6 py-2 text-xs text-red-600">
                    {error}
                  </div>
                )}

                {/* MESSAGE AREA */}
                <div className="flex-1 overflow-y-auto bg-[#F7F4EE] px-5 py-6 md:px-8">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center text-sm text-stone-400">
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <FiMessageCircle className="mx-auto h-10 w-10 text-stone-300" />

                        <p className="mt-3 font-serif text-xl font-semibold text-stone-600">
                          Start a conversation
                        </p>

                        <p className="mt-1 text-sm text-stone-400">
                          Send a message to {selectedUser.name}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-y-5">
                      {messages.map((message) => {
                        const senderId = message.sender?._id
                          ? String(message.sender._id)
                          : String(message.sender);

                        const isMine =
                          senderId === String(user._id);

                        const senderName =
                          message.sender?.name ||
                          selectedUser.name;

                        const senderAvatar =
                          message.sender?.avatarUrl || "";

                        const initials =
                          senderName
                            ?.split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "U";

                        // -------------------------------------------------
                        // RECEIVED = LEFT COLUMN
                        // -------------------------------------------------
                        if (!isMine) {
                          return (
                            <div
                              key={message._id}
                              className="col-start-1 flex w-full justify-start"
                            >
                              <div className="flex max-w-[85%] items-end gap-2">
                                {senderAvatar ? (
                                  <img
                                    src={senderAvatar}
                                    alt={senderName}
                                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DDE6DF] text-[10px] font-bold text-[#1B3B2B]">
                                    {initials}
                                  </div>
                                )}

                                <div className="flex flex-col items-start">
                                  <span className="mb-1 ml-1 text-[11px] font-semibold text-stone-500">
                                    {senderName}
                                  </span>

                                  <div className="rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-3 shadow-sm">
                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-stone-800">
                                      {message.content}
                                    </p>

                                    <p className="mt-1 text-right text-[10px] text-stone-400">
                                      {formatTime(
                                        message.createdAt,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // -------------------------------------------------
                        // SENT = RIGHT COLUMN
                        // -------------------------------------------------
                        return (
                          <div
                            key={message._id}
                            className="col-start-2 flex w-full justify-end"
                          >
                            <div className="flex max-w-[85%] flex-col items-end">
                              <span className="mb-1 mr-1 text-[11px] font-semibold text-[#1B3B2B]">
                                You
                              </span>

                              <div className="rounded-2xl rounded-br-md bg-[#1B3B2B] px-4 py-3 shadow-sm">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white">
                                  {message.content}
                                </p>

                                <div className="mt-1 flex items-center justify-end gap-1">
                                  <span className="text-[10px] text-[#C8D7CE]">
                                    {formatTime(
                                      message.createdAt,
                                    )}
                                  </span>

                                  <FiCheck className="h-3 w-3 text-[#C8D7CE]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div
                        ref={messagesEndRef}
                        className="col-span-2"
                      />
                    </div>
                  )}
                </div>

                {/* COMPOSER */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-stone-200 bg-white p-4"
                >
                  <div className="mx-auto flex max-w-5xl items-center gap-3">
                    <input
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(event.target.value)
                      }
                      placeholder={`Message ${selectedUser.name}...`}
                      className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-[#FBF8F3] px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-[#1B3B2B]"
                    />

                    <button
                      type="submit"
                      disabled={
                        !messageText.trim() ||
                        !socketRef.current?.connected
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B3B2B] text-white transition hover:bg-[#153124] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <FiSend className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-[#F7F4EE] text-center">
                <div>
                  <FiMessageCircle className="mx-auto h-12 w-12 text-stone-300" />

                  <h2 className="mt-4 font-serif text-2xl font-bold text-stone-600">
                    Your conversations
                  </h2>

                  <p className="mt-2 text-sm text-stone-400">
                    Select a person to start chatting.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}