import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className="w-full md:ml-72 px-2 md:px-4 py-4 rounded-xl shadow bg-black min-h-screen pt-16 md:pt-0">
			<div>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />} 
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />} 
							{notification.type === "community_message" ? (
								<Link to={`/communities/${notification.communityId}/chat`}>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex gap-1'>
										<span className='font-bold'>@{notification.from.username}</span>{" "}
										{notification.message}
									</div>
								</Link>
							) : notification.type === "direct_message" ? (
								<Link to={`/direct/${notification.from.username}`}>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex gap-1'>
										<span className='font-bold'>@{notification.from.username}</span>{" "}
										{notification.message}
									</div>
								</Link>
							) : (
								notification.type === "like" || notification.type === "comment" || notification.type === "repost" ? (
									<Link to={`/profile/${notification.from.username}`}>
										<div className='avatar'>
											<div className='w-8 rounded-full'>
												<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
											</div>
										</div>
										<div className='flex gap-1'>
											<span className='font-bold'>@{notification.from.username}</span>{" "}
											{notification.type === "like"
												? "liked your post"
												: notification.type === "comment"
												? "commented on your post"
												: "reposted your post"}
										</div>
									</Link>
								) : (
									<Link to={`/profile/${notification.from.username}`}>
										<div className='avatar'>
											<div className='w-8 rounded-full'>
												<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
											</div>
										</div>
										<div className='flex gap-1'>
											<span className='font-bold'>@{notification.from.username}</span>{" "}
											followed you
										</div>
									</Link>
								)
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
export default NotificationPage;
