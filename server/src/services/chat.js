import { io } from "socket.io-client";

const API_BASE_URL = "http://localhost:5004/api";
const SOCKET_URL = "http://localhost:5004";

export async function getChatUsers(token) {
  const response = await fetch(`${API_BASE_URL}/chat/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Unable to load users");
  }

  return data.data;
}

export async function getChatMessages(token, userId) {
  const response = await fetch(
    `${API_BASE_URL}/chat/messages/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Unable to load messages");
  }

  return data.data;
}

export function createChatSocket(token) {
  return io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });
}

export function sendChatMessage(socket, receiverId, content) {
  return new Promise((resolve, reject) => {
    socket.emit(
      "send_message",
      {
        receiverId,
        content,
      },
      (response) => {
        if (response?.success) {
          resolve(response.data);
        } else {
          reject(
            new Error(
              response?.message || "Unable to send message",
            ),
          );
        }
      },
    );
  });
}