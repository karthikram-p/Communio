import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";

const Communities = () => {
    const [joinedCommunities, setJoinedCommunities] = useState([]);
    const [otherCommunities, setOtherCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authUser, setAuthUser] = useState(null);

    // Popup state for viewing and managing users in a community
    const [showUsersPopup, setShowUsersPopup] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const usersPopupRef = useRef(null);

    useEffect(() => {
        // Fetch user and communities in parallel
        const fetchData = async () => {
            try {
                const [userRes, commRes] = await Promise.all([
                    axios.get("/api/auth/me", { withCredentials: true }),
                    axios.get("/api/communities", { withCredentials: true }),
                ]);
                setAuthUser(userRes.data);

                // Segregate joined and other communities
                const joined = commRes.data.filter(
                    (c) =>
                        c.members &&
                        c.members.some(
                            (m) =>
                                (typeof m === "string" && m === userRes.data._id) ||
                                (typeof m === "object" && m._id === userRes.data._id)
                        )
                );
                const others = commRes.data.filter(
                    (c) =>
                        !c.members ||
                        !c.members.some(
                            (m) =>
                                (typeof m === "string" && m === userRes.data._id) ||
                                (typeof m === "object" && m._id === userRes.data._id)
                        )
                );
                setJoinedCommunities(joined);
                setOtherCommunities(others);
            } catch {
                setJoinedCommunities([]);
                setOtherCommunities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Join a community
    const handleJoin = async (communityId) => {
        try {
            await axios.post(`/api/communities/${communityId}/join`, {}, { withCredentials: true });
            toast.success("Joined community!");
            // Refresh communities
            setLoading(true);
            const [userRes, commRes] = await Promise.all([
                axios.get("/api/auth/me", { withCredentials: true }),
                axios.get("/api/communities", { withCredentials: true }),
            ]);
            setAuthUser(userRes.data);
            const joined = commRes.data.filter(
                (c) =>
                    c.members &&
                    c.members.some(
                        (m) =>
                            (typeof m === "string" && m === userRes.data._id) ||
                            (typeof m === "object" && m._id === userRes.data._id)
                    )
            );
            const others = commRes.data.filter(
                (c) =>
                    !c.members ||
                    !c.members.some(
                        (m) =>
                            (typeof m === "string" && m === userRes.data._id) ||
                            (typeof m === "object" && m._id === userRes.data._id)
                    )
            );
            setJoinedCommunities(joined);
            setOtherCommunities(others);
        } catch (err) {
            toast.error("Failed to join community");
        } finally {
            setLoading(false);
        }
    };

    // Open users popup for a community
    const handleShowUsers = async (community) => {
        // Fetch full community info with populated members
        try {
            const res = await axios.get(`/api/communities/${community._id}`, { withCredentials: true });
            setSelectedCommunity(res.data);
            setShowUsersPopup(true);
        } catch {
            toast.error("Failed to load community members");
        }
    };

    // Remove user from community (only creator can do this)
    const handleRemoveUser = async (userId) => {
        if (!selectedCommunity) return;
        try {
            await axios.post(
                `/api/communities/${selectedCommunity._id}/remove`,
                { userId },
                { withCredentials: true }
            );
            // Refresh the selected community's members
            const res = await axios.get(`/api/communities/${selectedCommunity._id}`, { withCredentials: true });
            setSelectedCommunity(res.data);
            toast.success("User removed");
        } catch {
            toast.error("Failed to remove user");
        }
    };

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                usersPopupRef.current &&
                !usersPopupRef.current.contains(event.target)
            ) {
                setShowUsersPopup(false);
            }
        };
        if (showUsersPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUsersPopup]);

    // Users popup portal
    const usersPopup = showUsersPopup && selectedCommunity
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div
                    ref={usersPopupRef}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl p-6 w-full max-w-md"
                >
                    <div className="flex items-center mb-4">
                        <img
                            src={selectedCommunity.profilePhoto || "/default-community.png"}
                            alt={selectedCommunity.name}
                            className="w-10 h-10 rounded-lg object-cover border border-blue-400 mr-3"
                        />
                        <span className="text-white font-semibold text-lg">{selectedCommunity.name}</span>
                        <button
                            onClick={() => setShowUsersPopup(false)}
                            className="ml-auto text-neutral-400 hover:text-white px-2"
                            title="Close"
                        >
                            &#10005;
                        </button>
                    </div>
                    <div className="mb-2 text-blue-400 font-semibold">Members</div>
                    <ul className="max-h-64 overflow-y-auto flex flex-col gap-2">
                        {selectedCommunity.members && selectedCommunity.members.length > 0 ? (
                            selectedCommunity.members.map((member) => {
                                // Robust owner check for both object and string
                                const ownerId = selectedCommunity.owner._id || selectedCommunity.owner;
                                const memberId = member._id || member;
                                const isOwner = ownerId === memberId;
                                const amIOwner = ownerId === (authUser?._id || authUser);

                                return (
                                    <li
                                        key={typeof member === "string" ? member : member._id}
                                        className="flex items-center gap-3 bg-neutral-800 rounded-lg px-3 py-2"
                                    >
                                        <img
                                            src={member.profilePhoto || "/avatar-placeholder.png"}
                                            alt={member.username}
                                            className="w-8 h-8 rounded-full border border-blue-400 object-cover"
                                        />
                                        <Link
                                            to={`/profile/${member.username}`}
                                            className="text-blue-300 hover:underline font-medium"
                                            onClick={() => setShowUsersPopup(false)}
                                        >
                                            {member.username}
                                        </Link>
                                        {isOwner ? (
                                            <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded font-bold">
                                                Owner
                                            </span>
                                        ) : (
                                            amIOwner && (
                                                <button
                                                    className="ml-auto text-red-500 hover:text-red-700"
                                                    title="Remove user"
                                                    onClick={() => handleRemoveUser(memberId)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="text-neutral-400">No members</li>
                        )}
                    </ul>
                </div>
            </div>,
            document.body
        )
        : null;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="text-white">Loading communities...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h2 className="text-white text-3xl font-bold mb-8 text-center">Communities</h2>
            <div className="mb-10">
                <h3 className="text-blue-400 text-xl font-semibold mb-4">Your Communities</h3>
                <div className="max-h-96 overflow-y-auto">
                    {joinedCommunities.length === 0 ? (
                        <div className="text-neutral-400 mb-8">You have not joined any communities yet.</div>
                    ) : (
                        <div className="flex flex-col gap-6 mb-8">
                            {joinedCommunities.map((c) => (
                                <div
                                    key={c._id}
                                    className="bg-gradient-to-br from-blue-900/60 to-blue-800/30 rounded-2xl border border-blue-700 p-6 flex items-center gap-5 shadow-lg hover:shadow-blue-900/40 transition"
                                >
                                    <img
                                        src={c.profilePhoto || "/default-community.png"}
                                        alt={c.name}
                                        className="w-20 h-20 rounded-xl object-cover border-2 border-blue-400 shadow"
                                        onError={e => { e.target.onerror = null; e.target.src = "/default-community.png"; }}
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-white text-lg font-bold">{c.name}</h4>
                                        <p className="text-neutral-300 text-sm mb-2">{c.description}</p>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/communities/${c._id}/chat`}
                                                className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow"
                                            >
                                                Open Chat
                                            </Link>
                                            <button
                                                className="inline-block bg-neutral-700 text-white px-4 py-1.5 rounded-lg hover:bg-neutral-800 text-sm font-medium shadow"
                                                onClick={() => handleShowUsers(c)}
                                            >
                                                View Members
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div>
                <h3 className="text-neutral-300 text-xl font-semibold mb-4">Discover Communities</h3>
                <div className="max-h-96 overflow-y-auto">
                    {otherCommunities.length === 0 ? (
                        <div className="text-neutral-500">No more communities to join.</div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {otherCommunities.map((c) => (
                                <div
                                    key={c._id}
                                    className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 flex items-center gap-5 shadow hover:shadow-blue-900/20 transition"
                                >
                                    <img
                                        src={c.profilePhoto || "/default-community.png"}
                                        alt={c.name}
                                        className="w-20 h-20 rounded-xl object-cover border-2 border-neutral-700 shadow"
                                        onError={e => { e.target.onerror = null; e.target.src = "/default-community.png"; }}
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-white text-lg font-bold">{c.name}</h4>
                                        <p className="text-neutral-400 text-sm mb-2">{c.description}</p>
                                        <button
                                            className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow"
                                            onClick={() => handleJoin(c._id)}
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {usersPopup}
        </div>
    );
};

export default Communities;