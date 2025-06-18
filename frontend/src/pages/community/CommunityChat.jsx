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
        <div className="mt-8 flex flex-col items-center">
            <div className="w-full max-w-5xl ml-20 md:ml-60 bg-neutral-900 p-6 rounded-xl shadow-lg border border-neutral-800">
                {/* Community Header */}
                <div className="flex items-center mb-8 bg-gradient-to-r from-blue-900/70 to-blue-800/40 rounded-xl p-8 shadow-lg w-full">
                    <img
                        src={community.profilePhoto || "/default-community.png"}
                        alt={community.name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-blue-500 shadow mr-7"
                        onError={e => { e.target.onerror = null; e.target.src = "/default-community.png"; }}
                    />
                    <div>
                        <h2 className="text-white text-3xl font-bold">{community.name}</h2>
                        <p className="text-neutral-300 text-lg">{community.description}</p>
                        {notifications.length > 0 && (
                            <button
                                className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow"
                                onClick={handleMarkAsRead}
                                disabled={marking}
                            >
                                {marking ? "Marking..." : `Mark ${notifications.length} as Read`}
                            </button>
                        )}
                    </div>
                </div>
                {/* Chat Messages */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 max-h-[60vh] min-h-[300px] overflow-y-auto shadow-inner flex flex-col gap-4 w-full">
                    {messages.length === 0 ? (
                        <div className="text-neutral-500 text-center mt-10">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg._id} className="flex items-start gap-4 group hover:bg-neutral-800/60 rounded-lg px-3 py-2 transition">
                                <Link to={`/profile/${msg.sender.username}`}>
                                    <img
                                        src={msg.sender.profilePhoto || "/avatar-placeholder.png"}
                                        alt={msg.sender.username}
                                        className="w-12 h-12 rounded-full border-2 border-blue-400 shadow"
                                        onError={e => { e.target.onerror = null; e.target.src = "/avatar-placeholder.png"; }}
                                    />
                                </Link>
                                <div className="flex-1">
                                    <Link
                                        to={`/profile/${msg.sender.username}`}
                                        className="text-blue-400 font-semibold hover:underline text-base"
                                    >
                                        {msg.sender.username}
                                    </Link>
                                    <div className="text-neutral-100 text-lg mt-0.5">{msg.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {/* Message Input */}
                <form onSubmit={sendMessage} className="flex gap-3 mt-2 w-full">
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-4 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:border-blue-500 outline-none text-lg"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 transition text-lg"
                        disabled={loading}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommunityChat;