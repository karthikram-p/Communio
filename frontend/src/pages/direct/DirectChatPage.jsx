import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";

const DirectChatPage = () => {
  const { username } = useParams();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch recipient user info
  const { data: recipient } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`/api/users/profile/${username}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
  });

  // Fetch direct messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ["directMessages", username],
    enabled: !!recipient,
    queryFn: async () => {
      const res = await fetch(`/api/direct/${recipient._id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchInterval: 2000,
  });

  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async () => {
      await fetch(`/api/direct/${recipient._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: message }),
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["directMessages", username] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!recipient) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex flex-col h-[80vh] w-full md:w-[55vw] mx-auto border border-neutral-800 rounded-xl bg-black mt-8 shadow-lg" style={{ minHeight: 500, maxWidth: '100vw' }}>
      <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
        <img src={recipient.profileImg || "/avatar-placeholder.png"} alt={recipient.username} className="w-10 h-10 rounded-full" />
        <div>
          <div className="text-white font-bold">{recipient.fullName}</div>
          <div className="text-neutral-400 text-sm">@{recipient.username}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ minHeight: 300 }}>
        {isLoading ? (
          <div className="text-neutral-400">Loading messages...</div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.sender.username === username ? "justify-start" : "justify-end"}`} >
              <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender.username === username ? "bg-neutral-800 text-white" : "bg-blue-600 text-white"}`}>
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs text-neutral-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-neutral-400">No messages yet. Say hi!</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="flex items-center gap-2 p-4 border-t border-neutral-800"
        onSubmit={e => {
          e.preventDefault();
          if (message.trim()) sendMessage();
        }}
      >
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 text-white outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={isPending}
        />
        <button
          type="submit"
          className="btn btn-primary px-4 py-2 rounded-lg text-white"
          disabled={isPending || !message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default DirectChatPage;
