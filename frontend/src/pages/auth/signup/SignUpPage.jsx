import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import communioLogo from "../../../components/svgs/communio.png";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});
	const [errors, setErrors] = useState({});

	const queryClient = useQueryClient();

	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, username, fullName, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to create account");
			return data;
		},
		onSuccess: (data) => {
			toast.success("Account created successfully");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			if (data && data.username) {
				navigate(`/profile/${data.username}`, { state: { showProfilePrompt: true } });
			}
		},
	});

	const validate = () => {
		const errs = {};
		if (!/^[A-Za-z0-9_]+$/.test(formData.username)) {
			errs.username = "Username can only contain letters, numbers, and underscores.";
		}
		if (!/^.{8,}$/.test(formData.password)) {
			errs.password = "Password must be at least 8 characters long.";
		} else if (!/[A-Z]/.test(formData.password)) {
			errs.password = "Password must contain at least one uppercase letter.";
		} else if (!/[a-z]/.test(formData.password)) {
			errs.password = "Password must contain at least one lowercase letter.";
		} else if (!/[0-9]/.test(formData.password)) {
			errs.password = "Password must contain at least one number.";
		} else if (!/[^A-Za-z0-9]/.test(formData.password)) {
			errs.password = "Password must contain at least one special character.";
		}
		return errs;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = validate();
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length === 0) {
			mutate(formData);
		}
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
	const [userCount, setUserCount] = useState(null);
	useEffect(() => {
		fetch('/api/users/count')
			.then(res => res.json())
			.then(data => setUserCount(data.count))
			.catch(() => setUserCount(null));
	}, []);

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
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='email'
							className='grow'
							placeholder='Email'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>
					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser />
							<input
								type='text'
								className='grow '
								placeholder='Username'
								name='username'
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline />
							<input
								type='text'
								className='grow'
								placeholder='Full Name'
								name='fullName'
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
					{errors.username && <p className='text-red-500'>{errors.username}</p>}
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
					{errors.password && <p className='text-red-500'>{errors.password}</p>}
				{/* Skills field removed as per new requirements */}
				<button className='btn rounded-full btn-primary text-white'>
					{isPending ? "Loading..." : "Sign up"}
				</button>
				{isError && <p className='text-red-500'>{error.message}</p>}
			</form>
			<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
				<p className='text-white text-lg'>Already have an account?</p>
				<Link to='/login'>
					<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
				</Link>
			</div>
		</div>
	</div>
);
};
export default SignUpPage;
