import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import communioLogo from "../../../components/svgs/communio.png";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
// ADDED: Icons for showing/hiding password
import { IoEye, IoEyeOff } from "react-icons/io5";

import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define your temporary credentials here
const TEMP_USERNAME = "testuser";
const TEMP_PASSWORD = "Testuser@123"; // Replace with your actual temp password

const LoginPage = () => {
    const [userCount, setUserCount] = useState(null);
    // ADDED: State to manage password visibility
    const [showPassword, setShowPassword] = useState(false); 
    
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

    const handleTestAccountLogin = () => {
        loginMutation({ username: TEMP_USERNAME, password: TEMP_PASSWORD });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Check if the temporary login is pending to disable both buttons
    const isTestLoginPending = isPending; 

    return (
        <div className='max-w-screen-xl mx-auto flex h-screen'>
            <div className='flex-1 hidden lg:flex items-center  justify-center'>
                <img src={communioLogo} alt="Communio Logo" className="h-full w-auto max-w-xs object-contain rounded-lg" />
            </div>
            <div className='flex-1 flex flex-col justify-center items-center'>
                <form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
                    {userCount !== null && (
                        <div className="mb-2 text-white text-lg font-semibold bg-blue-900 bg-opacity-80 px-6 py-2 rounded-full shadow text-center">
                            Hurry up and join, we already have {userCount} users!
                        </div>
                    )}
                    <img src={communioLogo} alt="Communio Logo" className="w-24 lg:hidden h-auto object-contain" />
                    <div className="text-center">
                        <p className="text-blue-200 text-base mb-2 mt-1">Skill Exchange Platform: Connect, share, and swap your skills with others. Learn, teach, and grow together!</p>
                    </div>
                    <h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
                    
                    {/* Username Input */}
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

                    {/* Password Input with Toggle */}
                    <label className='input input-bordered rounded flex items-center gap-2'>
                        <MdPassword />
                        <input
                            // CHANGED: Toggle type based on showPassword state
                            type={showPassword ? 'text' : 'password'}
                            className='grow'
                            placeholder='Password'
                            name='password'
                            onChange={handleInputChange}
                            value={formData.password}
                        />
                        {/* ADDED: Clickable icon to toggle visibility */}
                        <div 
                            className="cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <IoEyeOff /> : <IoEye />}
                        </div>
                    </label>
                    
                    <button className='btn rounded-full btn-primary text-white' disabled={isTestLoginPending}>
                        {isTestLoginPending ? "Loading..." : "Login"}
                    </button>

                    {/* Test Account Button (Optional) */}
                    <button 
                        type="button" 
                        className='btn rounded-full btn-success text-white'
                        onClick={handleTestAccountLogin}
                        disabled={isTestLoginPending}
                    >
                        {isTestLoginPending ? "Logging in..." : "Login with Test Account 🚀"}
                    </button>

                    {/* DISPLAY CREDENTIALS HERE */}
                    <div className="text-center bg-gray-700 bg-opacity-70 p-3 rounded-lg mt-2 text-white">
                        <p className="font-bold mb-1">Or use the Test Account:</p>
                        <p>Username: <span className="font-semibold text-yellow-300">{TEMP_USERNAME}</span></p>
                        <p>Password: <span className="font-semibold text-yellow-300">{TEMP_PASSWORD}</span></p>
                    </div>
                    {/* END DISPLAY */}

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