import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const CommunityChat = () => {
    const { id } = useParams();
    const [community, setCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [marking, setMarking] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch community, messages, and notifications
    useEffect(() => {
        axios.get(`/api/communities/${id}`, { withCredentials: true })
            .then(res => setCommunity(res.data));
        axios.get(`/api/communities/${id}/messages`, { withCredentials: true })
            .then(res => setMessages(res.data));
        fetchNotifications();
        // eslint-disable-next-line
    }, [id]);

    // Fetch notifications for this community
    const fetchNotifications = async () => {
        try {
            const res = await axios.get("/api/notifications", { withCredentials: true });
            setNotifications(
                res.data.filter(
                    n => n.type === "community_message" && n.communityId === id && !n.read
                )
            );
        } catch {
            setNotifications([]);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(
                `/api/communities/${id}/message`,
                { text },
                { withCredentials: true }
            );
            setMessages([...messages, res.data]);
            setText("");
            fetchNotifications();
        } finally {
            setLoading(false);
        }
    };

    // Mark all chat notifications as read for this community
    const handleMarkAsRead = async () => {
        setMarking(true);
        try {
            await axios.post(
                "/api/notifications/mark-community-messages-read",
                { communityId: id },
                { withCredentials: true }
            );
            await fetchNotifications();
        } catch {
            // Optionally show error
        } finally {
            setMarking(false);
        }
    };

    if (!community) return <div className="text-white">Loading...</div>;

    return (
        <div className="flex flex-col h-[80vh] w-full md:w-[55vw] mx-auto border border-neutral-800 rounded-xl bg-black mt-8 shadow-lg" style={{ minHeight: 500, maxWidth: '100vw' }}>
            <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
                <img src={community.profilePhoto || "/default-community.png"} alt={community.name} className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500" />
                <div>
                    <div className="text-white font-bold text-lg">{community.name}</div>
                    <div className="text-neutral-400 text-sm">{community.description}</div>
                </div>
                {notifications.length > 0 && (
                    <button
                        className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow"
                        onClick={handleMarkAsRead}
                        disabled={marking}
                    >
                        {marking ? "Marking..." : `Mark ${notifications.length} as Read`}
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ minHeight: 300 }}>
                {messages.length === 0 ? (
                    <div className="text-neutral-400 text-center mt-10">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg._id} className={`flex ${msg.sender.username === community.name ? "justify-start" : "justify-end"}`}>
                            <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender.username === community.name ? "bg-neutral-800 text-white" : "bg-blue-600 text-white"}`}>
                                <div className="text-sm">{msg.text}</div>
                                <div className="text-xs text-neutral-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form
                className="flex items-center gap-2 p-4 border-t border-neutral-800"
                onSubmit={e => {
                    e.preventDefault();
                    if (text.trim()) sendMessage(e);
                }}
            >
                <input
                    type="text"
                    className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 text-white outline-none"
                    placeholder="Type a message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn btn-primary px-4 py-2 rounded-lg text-white"
                    disabled={loading || !text.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default CommunityChat;