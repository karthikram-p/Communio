import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import useFollow from "../../hooks/useFollow";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";


const RightPanel = () => {
    const location = useLocation();
    const { data: suggestedUsers, isLoading } = useQuery({
        queryKey: ["suggestedUsers"],
        queryFn: async () => {
            try {
                const res = await fetch("/api/users/suggested");
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong!");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
    });
    const { follow, isPending } = useFollow();

    // Hide right panel on community chat page or direct message page
    const hideRightPanel =
        /^\/communities\/[^/]+\/chat$/.test(location.pathname) ||
        /^\/direct\//.test(location.pathname);
    if (hideRightPanel) return null;

    if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

    return (
        <div className='hidden lg:block my-4 mx-2'>
            <div className='bg-black border border-neutral-900 p-4 rounded-xl sticky top-2 shadow-xl'>
                <p className='font-bold text-white mb-3'>Who to follow</p>
                <div className='flex flex-col gap-4'>
                    {isLoading && (
                        <>
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                        </>
                    )}
                    {!isLoading &&
                        suggestedUsers?.map((user) => (
                            <Link
                                to={`/profile/${user.username}`}
                                className='flex items-center justify-between gap-4 group rounded-lg transition'
                                key={user._id}
                            >
                                <div className='flex gap-2 items-center'>
                                    <div className='avatar'>
                                        <div className='w-10 h-10 rounded-xl overflow-hidden border-2 border-neutral-800 group-hover:border-white transition'>
                                            <img src={user.profileImg || "/avatar-placeholder.png"} />
                                        </div>
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='font-semibold tracking-tight truncate w-28 text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] transition'>
                                            {user.fullName}
                                        </span>
                                        <span className='text-sm text-neutral-400'>@{user.username}</span>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        className='btn bg-white text-black hover:bg-neutral-200 rounded-full btn-sm shadow'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            follow(user._id);
                                        }}
                                    >
                                        {isPending ? <LoadingSpinner size='sm' /> : "Follow"}
                                    </button>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
};
export default RightPanel;