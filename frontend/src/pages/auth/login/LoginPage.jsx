import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import communioLogo from "../../../components/svgs/communio.png";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const LoginPage = () => {
	const [userCount, setUserCount] = useState(null);
	useEffect(() => {
		fetch('/api/users/count')
			.then(res => res.json())
			.then(data => setUserCount(data.count))
			.catch(() => setUserCount(null));
	}, []);
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const queryClient = useQueryClient();

	const {
		mutate: loginMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ username, password }) => {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			if (data && data.username) {
				navigate(`/profile/${data.username}`, { state: { showProfilePrompt: true } });
			}
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<img src={communioLogo} alt="Communio Logo" className="lg:w-2/3 rounded-lg" />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					{userCount !== null && (
						<div className="mb-2 text-white text-lg font-semibold bg-blue-900 bg-opacity-80 px-6 py-2 rounded-full shadow text-center">
							Hurry up and join, we already have {userCount} users!
						</div>
					)}
					<img src={communioLogo} alt="Communio Logo" className="w-24 lg:hidden" />
					<div className="text-center">
						<p className="text-blue-200 text-base mb-2 mt-1">Skill Exchange Platform: Connect, share, and swap your skills with others. Learn, teach, and grow together!</p>
					</div>
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? "Loading..." : "Login"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;
