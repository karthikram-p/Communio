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
    const [currentUser, setCurrentUser] = useState(null); 
    const messagesEndRef = useRef(null);

    // 1. Fetch current user on mount 
    useEffect(() => {
        // Based on your console log, the original endpoint returned a 404.
        // We'll try a common alternative, but you MUST confirm the correct route in your backend.
        axios.get("/api/auth/me", { withCredentials: true }) 
            .then(res => {
                console.log("SUCCESS: Current User Data:", res.data); 
                setCurrentUser(res.data);
            })
            .catch(error => {
                // If this fails, the app is stuck on "Loading chat..."
                console.error("ERROR: Failed to fetch current user.", error.response || error.message);
                setCurrentUser(null);
            });
    }, []);

    // 2. Fetch community, messages, and notifications
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

    // Auto-scroll to the latest message
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

    // Display loading until essential data is fetched
    if (!community || !currentUser) {
        return <div className="text-white p-4">Loading chat... (Please confirm your /api/auth/me endpoint is correct)</div>;
    }

    return (
    <div className="flex flex-col h-screen w-full md:ml-72 bg-black min-h-screen pt-16 md:pt-0" style={{ minHeight: '100vh' }}>
            {/* Chat Header */}
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
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 300 }}>
                {messages.length === 0 ? (
                    <div className="text-neutral-400 text-center mt-10">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg) => {
                        if (!msg.sender || !currentUser) return null; 

                        const isMyMessage = msg.sender._id === currentUser._id;
                        
                        return (
                            <div 
                                key={msg._id} 
                                // Align container left or right
                                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            >
                                <div className="max-w-xs flex flex-col">
                                    {/* Sender Name/Link (Visible only for others, above the bubble) */}
                                    {!isMyMessage && (
                                        <Link 
                                            to={`/profile/${msg.sender.username}`}
                                            className="text-sm text-neutral-400 mb-1 hover:underline cursor-pointer"
                                        >
                                            {msg.sender.username}
                                        </Link>
                                    )}

                                    {/* Message Bubble */}
                                    <div 
                                        className={`px-3 py-2 rounded-xl ${
                                            // Apply rounded corners differently based on sender
                                            isMyMessage 
                                                ? "bg-blue-600 text-white rounded-br-none" 
                                                : "bg-neutral-800 text-white rounded-tl-none"
                                        }`}
                                    >
                                        {/* Optional: Show name on my own message in small text */}
                                        {isMyMessage && (
                                            <div className="text-xs font-semibold text-blue-200 mb-1 text-right">
                                                You
                                            </div>
                                        )}

                                        <div className="text-sm">{msg.text}</div>
                                        <div className="text-xs text-neutral-400 mt-1 text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input Form */}
            <form
                className="flex items-center gap-2 p-4 border-t border-neutral-800"
                onSubmit={sendMessage} 
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