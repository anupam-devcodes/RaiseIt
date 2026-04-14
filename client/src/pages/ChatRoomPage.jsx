import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { getApiBaseUrl } from "../services/apiClient";
import { getCommunityById } from "../services/communityService";
import { getCommunityMessages, sendCommunityMessage } from "../services/messageService";

function ChatRoomPage() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const socket = useMemo(() => io(getApiBaseUrl().replace("/api", "")), []);

  useEffect(() => {
    const load = async () => {
      try {
        const communityData = await getCommunityById(id);
        const messageData = await getCommunityMessages(id);
        setCommunity(communityData?.community || null);
        setMessages(messageData.messages || []);
        setIsChatLocked(Boolean(messageData.isChatLocked));
      } catch (err) {
        showToast(err.message || "Failed to load chat", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    socket.emit("community:join-room", { communityId: id });
    socket.on("community:new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on("community:message-updated", ({ message }) => {
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    });
    socket.on("community:message-blocked", ({ reason }) => {
      showToast(reason || "Message blocked", "error");
    });
    return () => {
      socket.emit("community:leave-room", { communityId: id });
      socket.off("community:new-message");
      socket.off("community:message-updated");
      socket.off("community:message-blocked");
    };
  }, [id, showToast, socket]);

  const sendMessage = async () => {
    if (!text.trim() || isChatLocked) return;
    try {
      const created = await sendCommunityMessage(id, { content: text, type: "text" });
      setMessages((prev) => [...prev, created]);
      setText("");
    } catch (err) {
      showToast(err.message || "Failed to send message", "error");
    }
  };

  return (
    <AppShell>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-semibold">{community?.name || "Chat Room"}</h2>
        {loading && <p className="mt-2 text-sm text-slate-600">Loading chat...</p>}
        {isChatLocked && (
          <p className="mt-2 rounded bg-slate-100 px-3 py-2 text-sm text-slate-600">
            Chat is read-only for this community.
          </p>
        )}
        <div className="mt-4 h-[420px] space-y-2 overflow-y-auto rounded border border-slate-200 p-3">
          {!loading && messages.length === 0 && (
            <p className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No messages yet. Start the conversation.
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg._id} className="rounded bg-slate-50 p-2">
              <p className="text-xs text-slate-500">{msg.sender?.name || "User"}</p>
              <p className="text-sm">{msg.content}</p>
              {msg.type === "video" && msg.mediaUrl && (
                <video className="mt-2 h-44 w-full rounded object-cover" src={msg.mediaUrl} autoPlay muted loop playsInline />
              )}
              {msg.type === "image" && msg.mediaUrl && (
                <img className="mt-2 h-44 w-full rounded object-cover" src={msg.mediaUrl} alt="message media" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 rounded border px-3 py-2" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} disabled={isChatLocked} />
          <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" onClick={sendMessage} disabled={isChatLocked}>Send</button>
        </div>
      </div>
    </AppShell>
  );
}

export default ChatRoomPage;
