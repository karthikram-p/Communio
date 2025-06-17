import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";

const Sidebar = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { mutate: logout } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch("/api/auth/logout", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            navigate("/login");
        },
        onError: () => {
            toast.error("Logout failed");
        },
    });
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

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

    // Search state
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
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
            const res = await fetch(`/api/users/search?username=${encodeURIComponent(value)}`);
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

    // Utility classes for icons and text
    const iconBase = "text-white transition-all duration-200";
    const iconGlow = "group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]";
    const textBase = "text-white font-semibold transition-all duration-200";
    const textGlow = "group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]";

    return (
        <aside className="md:flex-[2_2_0] w-20 max-w-60 bg-black border-r border-neutral-900 shadow-xl min-h-screen flex flex-col">
            <div className="sticky top-0 left-0 flex flex-col h-screen">
                <Link to='/' className='flex justify-center md:justify-start py-6 group'>
                    <XSvg className={`w-14 h-14 rounded-xl bg-black p-2 shadow-lg hover:scale-105 transition ${iconBase} ${iconGlow}`} />
                </Link>
                <ul className='flex flex-col gap-4 mt-2 px-2'>
                    <li>
                        <button
                            id="search-users-btn"
                            type="button"
                            onClick={handleIconClick}
                            className={`flex gap-3 items-center group rounded-xl py-3 px-4 w-full transition relative`}
                        >
                            <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                            <FiSearch className={`${iconBase} relative z-10 ${iconGlow}`} />
                            <span className={`text-lg hidden md:block relative z-10 ${textBase} ${textGlow}`}>Search users</span>
                        </button>
                        {showPopup && (
                            <div
                                ref={popupRef}
                                className="absolute left-0 right-0 z-50 mt-2 bg-black border border-neutral-800 rounded-xl shadow-xl p-4"
                                style={{ minWidth: "220px" }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <FiSearch className={iconBase} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Type username..."
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
                                            <li className="px-3 py-2 text-neutral-500">No users found</li>
                                        ) : (
                                            results.map((user) => (
                                                <li key={user._id}>
                                                    <Link
                                                        to={`/profile/${user.username}`}
                                                        className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 rounded"
                                                        onClick={handleClosePopup}
                                                    >
                                                        <img
                                                            src={user.profileImg || "/avatar-placeholder.png"}
                                                            alt={user.username}
                                                            className="w-7 h-7 rounded-lg"
                                                        />
                                                        <span className="text-white">{user.fullName} <span className="text-neutral-400">@{user.username}</span></span>
                                                    </Link>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                    </li>
                    <li>
                        <Link
                            to='/'
                            className={`flex gap-3 items-center group rounded-xl py-3 px-4 w-full transition relative`}
                        >
                            <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                            <MdHomeFilled className={`${iconBase} relative z-10 ${iconGlow}`} />
                            <span className={`text-lg hidden md:block relative z-10 ${textBase} ${textGlow}`}>Home</span>
                        </Link>
                    </li>
                    <li className='relative'>
                        <Link
                            to='/notifications'
                            className={`flex gap-3 items-center group rounded-xl py-3 px-4 w-full transition relative`}
                        >
                            <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                            <IoNotifications className={`${iconBase} relative z-10 ${iconGlow}`} />
                            <span className={`text-lg hidden md:block relative z-10 ${textBase} ${textGlow}`}>Notifications</span>
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-3 bg-white text-black text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
                                    {notificationCount}
                                </span>
                            )}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={`/profile/${authUser?.username}`}
                            className={`flex gap-3 items-center group rounded-xl py-3 px-4 w-full transition relative`}
                        >
                            <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                            <FaUser className={`${iconBase} relative z-10 ${iconGlow}`} />
                            <span className={`text-lg hidden md:block relative z-10 ${textBase} ${textGlow}`}>Profile</span>
                        </Link>
                    </li>
                    <li>
                        <button
                            className={`flex gap-3 items-center group rounded-xl py-3 px-4 w-full transition relative`}
                            onClick={() => navigate("/saved")}
                        >
                            <span className="absolute inset-0 rounded-xl group-hover:bg-neutral-900/80 group-hover:border group-hover:border-neutral-700 transition-all duration-200 pointer-events-none"></span>
                            <FaRegBookmark className={`${iconBase} relative z-10 ${iconGlow}`} />
                            <span className={`text-lg hidden md:block relative z-10 ${textBase} ${textGlow}`}>Saved Posts</span>
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
                            <p className='text-white font-bold text-base truncate'>{authUser?.fullName}</p>
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
    );
};
export default Sidebar;