import communioLogo from "../svgs/communio.png";
import BlueBulb from "../svgs/BlueBulb";
import { MdHomeFilled, MdGroup } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaRegBookmark } from "react-icons/fa6";
import { AiOutlinePlus } from "react-icons/ai";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { createPortal } from "react-dom";
import axios from "axios";
import { useDirectChats } from "../../hooks/useDirectChats";

function Sidebar() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const navigate = useNavigate();

    // Fetch notifications for the logged-in user
    const { data: notifications } = useQuery({
        queryKey: ["notifications"],
        enabled: !!authUser,
        queryFn: async () => {
            const res = await fetch(`/api/notifications`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch notifications");
            return res.json();
        },
    });
    const notificationCount = notifications?.length || 0;

    // Simple logout handler
    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        navigate("/login");
    };

    // Search state and type
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [searchType, setSearchType] = useState("user"); // 'user', 'community', 'skill'
    const searchInputRef = useRef(null);
    const popupRef = useRef(null);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.trim().length === 0) {
            setResults([]);
            return;
        }
        try {
            let url = "";
            if (searchType === "user") {
                url = `/api/users/search?username=${encodeURIComponent(value)}`;
            } else if (searchType === "community") {
                url = `/api/communities/search?name=${encodeURIComponent(value)}`;
            } else if (searchType === "skill") {
                url = `/api/users/search?skill=${encodeURIComponent(value)}`;
            }
            const res = await fetch(url, { credentials: "include" });
            const data = await res.json();
            setResults(data);
        } catch {
            setResults([]);
        }
    };

    const handleIconClick = () => {
        setShowPopup(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSearch("");
        setResults([]);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target) &&
                event.target.id !== "search-users-btn"
            ) {
                handleClosePopup();
            }
        };
        if (showPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPopup]);

    // Fetch joined communities for chat
    const [joinedCommunities, setJoinedCommunities] = useState([]);
    useEffect(() => {
        if (authUser) {
            axios
                .get("/api/communities", { withCredentials: true })
                .then((res) => {
                    setJoinedCommunities(
                        res.data.filter((c) =>
                            c.members?.some((m) =>
                                (typeof m === "string" && m === authUser._id) ||
                                (typeof m === "object" && m._id === authUser._id)
                            )
                        )
                    );
                })
                .catch(() => setJoinedCommunities([]));
        }
    }, [authUser]);

    // Popup state for joined communities and direct chats
    const [showChatsPopup, setShowChatsPopup] = useState(false);
    const chatsPopupRef = useRef(null);

    // Fetch direct chats
    const { data: directChats, isLoading: loadingDirectChats } = useDirectChats(!!authUser);

    // Close chats popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                chatsPopupRef.current &&
                !chatsPopupRef.current.contains(event.target) &&
                event.target.id !== "chats-popup-btn"
            ) {
                setShowChatsPopup(false);
            }
        };
        if (showChatsPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showChatsPopup]);

    // Portalized search popup
    const searchPopup = showPopup
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
                <div
                    ref={popupRef}
                    className="mt-24 bg-black border border-neutral-800 rounded-xl shadow-xl p-4"
                    style={{ minWidth: "340px" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FiSearch className="text-white transition-all duration-200" />
                        <select
                            value={searchType}
                            onChange={e => { setSearchType(e.target.value); setResults([]); setSearch(""); searchInputRef.current?.focus(); }}
                            className="bg-neutral-900 text-white border border-neutral-700 rounded px-2 py-1 outline-none"
                            style={{ minWidth: 100 }}
                        >
                            <option value="user">Users</option>
                            <option value="community">Communities</option>
                            <option value="skill">Skills</option>
                        </select>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder={searchType === "user" ? "Type username..." : searchType === "community" ? "Type community name..." : "Type skill..."}
                            className="flex-1 px-2 py-1 bg-transparent text-white outline-none"
                        />
                        <button
                            onClick={handleClosePopup}
                            className="text-neutral-400 hover:text-white px-2"
                            title="Close"
                        >
                            &#10005;
                        </button>
                    </div>
                    {search && (
                        <ul className="bg-neutral-900 rounded max-h-48 overflow-y-auto shadow-inner">
                            {results.length === 0 ? (
                                <li className="px-3 py-2 text-neutral-500">No results found</li>
                            ) : (
                                results.map((item) => (
                                    searchType === "user" || searchType === "skill" ? (
                                        <li key={item._id}>
                                            <Link
                                                to={`/profile/${item.username}`}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 rounded"
                                                onClick={handleClosePopup}
                                            >
                                                <img
                                                    src={item.profileImg || "/avatar-placeholder.png"}
                                                    alt={item.username}
                                                    className="w-7 h-7 rounded-lg"
                                                />
                                                <span className="text-white">{item.fullName} <span className="text-neutral-400">@{item.username}</span></span>
                                                {searchType === "skill" && item.skills && (
                                                    <span className="ml-2 text-xs text-blue-400">{item.skills.join(", ")}</span>
                                                )}
                                            </Link>
                                        </li>
                                    ) : (
                                        <li key={item._id}>
                                            <Link
                                                to={`/communities/${item._id}`}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 rounded"
                                                onClick={handleClosePopup}
                                            >
                                                <img
                                                    src={item.profilePhoto || "/default-community.png"}
                                                    alt={item.name}
                                                    className="w-7 h-7 rounded-lg"
                                                />
                                                <span className="text-white">{item.name}</span>
                                                {item.description && (
                                                    <span className="ml-2 text-xs text-neutral-400 truncate">{item.description}</span>
                                                )}
                                            </Link>
                                        </li>
                                    )
                                ))
                            )}
                        </ul>
                    )}
                </div>
            </div>,
            document.body
        )
        : null;

    // Chats popup portal (shows direct chats and joined communities)
    const chatsPopup = showChatsPopup
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
                <div
                    ref={chatsPopupRef}
                    className="mt-24 bg-black border border-neutral-800 rounded-xl shadow-xl p-4"
                    style={{ minWidth: "340px", maxHeight: "60vh", overflowY: "auto" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <HiChatBubbleLeftRight className="text-blue-400 text-xl" />
                        <span className="text-white font-semibold text-lg">Chats</span>
                        <button
                            onClick={() => setShowChatsPopup(false)}
                            className="ml-auto text-neutral-400 hover:text-white px-2"
                            title="Close"
                        >
                            &#10005;
                        </button>
                    </div>
                    {/* Direct Chats */}
                    <div className="mb-3">
                        <div className="text-neutral-400 text-xs font-semibold mb-1">Direct Messages</div>
                        {loadingDirectChats ? (
                            <div className="text-neutral-500 px-3 py-2">Loading...</div>
                        ) : directChats && directChats.length > 0 ? (
                            <ul className="flex flex-col gap-1 mb-2">
                                {directChats.map((chat) => (
                                    <li key={chat._id}>
                                        <Link
                                            to={`/direct/${chat.userInfo.username}`}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition"
                                            onClick={() => setShowChatsPopup(false)}
                                        >
                                            <img
                                                src={chat.userInfo.profileImg || "/avatar-placeholder.png"}
                                                alt={chat.userInfo.username}
                                                className="w-8 h-8 rounded-lg object-cover border border-green-400"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-white text-base truncate">{chat.userInfo.fullName}</span>
                                                <span className="text-neutral-400 text-xs truncate">@{chat.userInfo.username}</span>
                                                {chat.lastMessage && (
                                                    <span className="text-neutral-500 text-xs truncate">{chat.lastMessage}</span>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-neutral-500 px-3 py-2">No direct chats</div>
                        )}
                    </div>
                    {/* Community Chats */}
                    <div>
                        <div className="text-neutral-400 text-xs font-semibold mb-1">Communities</div>
                        {joinedCommunities.length === 0 ? (
                            <div className="text-neutral-500 px-3 py-2">No joined communities</div>
                        ) : (
                            <ul className="flex flex-col gap-1">
                                {joinedCommunities.map((c) => (
                                    <li key={c._id}>
                                        <Link
                                            to={`/communities/${c._id}/chat`}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition"
                                            onClick={() => setShowChatsPopup(false)}
                                        >
                                            <img
                                                src={c.profilePhoto || "/default-community.png"}
                                                alt={c.name}
                                                className="w-8 h-8 rounded-lg object-cover border border-blue-400"
                                                onError={e => { e.target.onerror = null; e.target.src = "/default-community.png"; }}
                                            />
                                            <span className="text-white text-base truncate">{c.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        )
        : null;

    // Utility classes for icons and text
    const iconBase = "text-white transition-all duration-200";
    const iconGlow = "group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]";
    const textBase = "text-white font-semibold transition-all duration-200 font-sans";
    const textGlow = "group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]";

    return (
        <>
            {/* Mobile Top Nav */}
            <nav className="md:hidden fixed top-0 left-0 w-full bg-black border-b border-neutral-900 shadow-xl z-50 flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                    <img src={communioLogo} alt="Logo" className="w-8 h-8 rounded bg-black" />
                    <span className="text-blue-200 text-base font-bold font-sans">Communio</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => { setMobileNavOpen(false); navigate('/notifications'); }} className="relative text-white focus:outline-none">
                        <span className="text-2xl">🔔</span>
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">{notificationCount}</span>
                        )}
                    </button>
                    <button onClick={() => setMobileNavOpen(v => !v)} className="text-white focus:outline-none">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>
            {/* Mobile Nav Drawer */}
            {mobileNavOpen && (
                <div className="md:hidden fixed top-12 left-0 w-full bg-black border-b border-neutral-900 shadow-xl z-40 flex flex-col animate-fade-in-down">
                    <ul className="flex flex-col gap-2 p-4">
                        {/* Repeat nav items as in sidebar, icons only or with text */}
                        <li><Link to='/' className="flex items-center gap-2 text-white py-2" onClick={()=>setMobileNavOpen(false)}><span className="text-lg">🏠</span>Home</Link></li>
                        <li><button className="flex items-center gap-2 text-white py-2 w-full text-left" onClick={()=>{setShowPopup(true);setMobileNavOpen(false);}}><FiSearch className="w-5 h-5" />Search</button></li>
                        <li><Link to='/communities' className="flex items-center gap-2 text-white py-2" onClick={()=>setMobileNavOpen(false)}><span className="text-lg">👥</span>Communities</Link></li>
                        <li><Link to='/communities/create' className="flex items-center gap-2 text-white py-2" onClick={()=>setMobileNavOpen(false)}><span className="text-lg">➕</span>Create Community</Link></li>
                        <li><Link to='/teams' className="flex items-center gap-2 text-white py-2" onClick={()=>setMobileNavOpen(false)}><span className="text-lg">🤝</span>Team Formation</Link></li>
                        <li><button className="flex items-center gap-2 text-white py-2 w-full text-left" onClick={()=>{setShowChatsPopup(true);setMobileNavOpen(false);}}><span className="text-lg">💬</span>Chats</button></li>
                        <li><Link to='/project-ideas' className="flex items-center gap-2 text-white py-2" onClick={()=>setMobileNavOpen(false)}><BlueBulb className="w-5 h-5" />Project Ideas</Link></li>
                        <li><Link to='/notifications' className="flex items-center gap-2 text-white py-2" onClick={()=>setMobileNavOpen(false)}><span className="text-lg">🔔</span>Notifications</Link></li>
                        <li><a href="https://guide-u-recommendations.streamlit.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white py-2"><span className="text-lg">🪄</span>Skill Development</a></li>
                        <li><button className="flex items-center gap-2 text-white py-2 w-full text-left" onClick={()=>{navigate("/saved");setMobileNavOpen(false);}}><FaRegBookmark className="w-5 h-5" />Saved Posts</button></li>
                        {authUser && <li><button className="flex items-center gap-2 text-white py-2 w-full text-left" onClick={()=>{navigate(`/profile/${authUser.username}`);setMobileNavOpen(false);}}><img src={authUser?.profileImg || "/avatar-placeholder.png"} className="w-6 h-6 rounded-full" />Profile</button></li>}
                    </ul>
                </div>
            )}
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed top-0 left-0 h-screen w-12 sm:w-16 md:w-32 lg:w-64 xl:w-72 bg-black border-r border-neutral-900 shadow-xl flex-col z-40 lg:left-4 xl:left-8">
                <div className="flex flex-col h-full">
                    <Link to='/' className='flex flex-col items-center md:items-start justify-center md:justify-start py-4 group'>
                        <img src={communioLogo} alt="Communio Logo" className="hidden sm:block w-12 h-12 lg:w-20 lg:h-20 rounded-xl bg-black p-1 shadow-lg transition group-hover:drop-shadow-[0_0_16px_white] group-hover:scale-105" />
                        <span className="hidden md:block text-blue-200 text-xs font-light tracking-wide mt-1 font-sans">Talk with people, exchange knowledge and experience, grow together</span>
                    </Link>
                    <ul className='flex flex-col gap-3 mt-2 px-1'>
                        <li>
                            <button
                                id="search-users-btn"
                                type="button"
                                onClick={handleIconClick}
                                className={`flex gap-2 items-center group rounded-xl py-2 px-2 w-full transition relative`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                                <FiSearch className={`${iconBase} relative z-10 ${iconGlow} text-base`} />
                                <span className={`text-base hidden md:block relative z-10 ${textBase} ${textGlow}`}>Search users</span>
                            </button>
                        </li>
                        <li>
                            <Link
                                to='/'
                                className={`flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative text-sm`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                                <span className="text-lg">🏠</span>
                                <span className={`text-base hidden md:block relative z-10 ${textBase} ${textGlow}`}>Home</span>
                            </Link>
                        </li>
                        {/* --- Communities and Create Community --- */}
                        <li>
                            <Link
                                to='/communities'
                                className={`flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative text-sm`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                                <span className="text-lg">👥</span>
                                <span className={`text-base hidden md:block relative z-10 ${textBase} ${textGlow}`}>Communities</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/communities/create'
                                className={`flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative text-sm`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                                <span className="text-lg">➕</span>
                                <span className={`text-base hidden md:block relative z-10 ${textBase} ${textGlow}`}>Create Community</span>
                            </Link>
                        </li>
                        {/* --- Team Formation --- */}
                        <li>
                            <Link
                                to='/teams'
                                className={`flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 hover:from-blue-300 hover:to-blue-500 shadow-lg text-sm`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-blue-500/20 group-hover:border group-hover:border-blue-500 transition-all duration-200 pointer-events-none"></span>
                                <span className="text-lg">🤝</span>
                                <span className={`text-base hidden md:block relative z-10 text-black font-semibold font-sans`}>Team Formation</span>
                            </Link>
                        </li>
                        {/* --- Community Chats (joined communities) as popup --- */}
                        <li>
                            <button
                                id="chats-popup-btn"
                                type="button"
                                onClick={() => setShowChatsPopup(true)}
                                className={`flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative text-sm`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-blue-700 transition-all duration-200 pointer-events-none"></span>
                                <span className="text-lg">💬</span>
                                <span className="text-base hidden md:block relative z-10 text-blue-400 font-semibold font-sans">Chats</span>
                            </button>
                        </li>
                        {/* --- Project Ideas --- */}
                        <li>
                            <Link
                                to='/project-ideas'
                                className={`flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500 shadow-lg text-sm`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-yellow-500/20 group-hover:border group-hover:border-yellow-500 transition-all duration-200 pointer-events-none"></span>
                                    <BlueBulb className="w-6 h-6 mr-1" />
                                <span className={`text-base hidden md:block relative z-10 text-black font-semibold font-sans`}>Project Ideas</span>
                            </Link>
                        </li>
                        {/* --- End Communities --- */}
                        <li className='relative'>
                            <Link
                                to='/notifications'
                                className={`flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative text-sm`}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                                <span className="text-lg">🔔</span>
                                <span className={`text-base hidden md:block relative z-10 ${textBase} ${textGlow}`}>Notifications</span>
                                {notificationCount > 0 && (
                                    <span className="absolute top-1 right-3 bg-white text-black text-xs font-bold rounded-full px-2 py-0.5 shadow-md font-sans">
                                        {notificationCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                        {/* --- Skill Development --- */}
                        <li>
                            <a
                                href="https://guide-u-recommendations.streamlit.app/" // <-- Replace with your app link
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-1 items-center group rounded-lg py-1 px-1 w-full transition relative text-sm"
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-green-900/80 group-hover:border group-hover:border-green-700 transition-all duration-200 pointer-events-none"></span>
                                <span className="text-lg">🪄</span>
                                <span className="text-base hidden md:block relative z-10 text-green-400 font-semibold font-sans">Skill Development <span className="ml-1">🔗</span></span>
                            </a>
                        </li>
                        <li>
                            <button
                                className={`flex gap-2 items-center group rounded-xl py-2 px-2 w-full transition relative`}
                                onClick={() => navigate("/saved")}
                            >
                                <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                                <FaRegBookmark className={`${iconBase} relative z-10 ${iconGlow}`} />
                                <span className={`text-base hidden md:block relative z-10 ${textBase} ${textGlow}`}>Saved Posts</span>
                            </button>
                        </li>
                    </ul>
                    {authUser && (
                        <div className={`mt-auto mb-10 flex gap-3 items-center group rounded-xl py-3 px-4 mx-2 shadow transition cursor-pointer relative`}
                            onClick={() => navigate(`/profile/${authUser.username}`)}
                        >
                            <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                            <div className='avatar hidden md:inline-flex relative z-10'>
                                <div className='w-10 h-10 rounded-xl overflow-hidden border-2 border-white'>
                                    <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
                                </div>
                            </div>
                            <div className='flex flex-col flex-1 min-w-0 relative z-10'>
                                <p className='text-white font-bold text-base truncate font-sans'>{authUser?.fullName}</p>
                                <p className='text-neutral-400 text-sm truncate'>@{authUser?.username}</p>
                            </div>
                            <BiLogOut
                                className={`${iconBase} relative z-10 ${iconGlow}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    logout();
                                }}
                            />
                        </div>
                    )}
                </div>
            </aside>
            {searchPopup}
            {chatsPopup}
    </>
    );
}

export default Sidebar;
