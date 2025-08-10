import RightPanel from "./components/common/RightPanel";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SavedPosts from "./pages/saved";

import Sidebar from "./components/common/Sidebar";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Import your new pages

import CreateCommunity from "./pages/community/CommunityCreate";
import Communities from "./pages/community/Communities";
import CommunityChat from "./pages/community/CommunityChat";
import DirectChatPage from "./pages/direct/DirectChatPage";

import ProjectIdeasPage from "./pages/ProjectIdeasPage";

import ProjectIdeaNewPage from "./pages/ProjectIdeaNewPage";
import ProjectIdeaDetailPage from "./pages/ProjectIdeaDetailPage";
import TeamFormationPage from "./pages/TeamFormationPage";

function App() {
    const { data: authUser, isLoading } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (data.error) return null;
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                console.log("authUser is here:", data);
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
        retry: false,
    });

    if (isLoading) {
        return (
            <div className='h-screen flex justify-center items-center'>
                <LoadingSpinner size='lg' />
            </div>
        );
    }

    // Only show RightPanel on home page
    const pathname = window.location.pathname.replace(/\/$/, ""); // Remove trailing slash for consistency
    const showRightPanel = pathname === '/';

    return (
        <div className='flex max-w-6xl mx-auto'>
            {authUser && <Sidebar />}
            <Routes>
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
                <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
                <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
                <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
                <Route path='/saved' element={authUser ? <SavedPosts /> : <Navigate to='/login' />} />

                {/* --- Community routes --- */}
                <Route path='/communities' element={authUser ? <Communities /> : <Navigate to='/login' />} />
                <Route path='/communities/create' element={authUser ? <CreateCommunity /> : <Navigate to='/login' />} />
                <Route path='/communities/:id/chat' element={authUser ? <CommunityChat /> : <Navigate to='/login' />} />
                {/* --- End Community routes --- */}

                {/* --- Direct chat route --- */}
                <Route path='/direct/:username' element={authUser ? <DirectChatPage /> : <Navigate to='/login' />} />

                    {/* --- Project Ideas route --- */}
                    <Route path='/project-ideas' element={authUser ? <ProjectIdeasPage /> : <Navigate to='/login' />} />
                        <Route path='/project-ideas/new' element={authUser ? <ProjectIdeaNewPage /> : <Navigate to='/login' />} />
                        <Route path='/project-ideas/:id' element={authUser ? <ProjectIdeaDetailPage /> : <Navigate to='/login' />} />

                <Route path='/teams' element={authUser ? <TeamFormationPage /> : <Navigate to='/login' />} />
            </Routes>
            {authUser && showRightPanel && <RightPanel />}
            <Toaster />
        </div>
    );
}

export default App;