import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoCloseSharp } from "react-icons/io5";
import { CiImageOn } from "react-icons/ci";
import { toast } from "react-hot-toast";

// Helper to convert file to base64
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const CommunityCreate = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        setFile(f);
        if (f) setPreview(URL.createObjectURL(f));
        else setPreview(null);
    };

    const handleRemoveImage = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let profilePhotoBase64 = "";
        try {
            if (file) {
                profilePhotoBase64 = await fileToBase64(file);
            }
            await axios.post(
                "/api/communities/create",
                { name, description, profilePhoto: profilePhotoBase64 },
                { withCredentials: true }
            );
            toast.success("Community created!");
            navigate("/communities");
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.message ||
                "Failed to create community";
            toast.error(msg);
        }
        setLoading(false);
    };

            return (
                <>
                    <div className="min-h-screen w-full flex items-center justify-center bg-black">
                        <div className="w-full max-w-3xl mx-auto bg-neutral-900 p-10 rounded-3xl shadow-2xl border border-neutral-800 flex flex-col justify-center">
                            <h2 className="text-white text-3xl font-bold mb-6 text-center">Create a New Community</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative w-24 h-24 mb-2">
                                        <div
                                            className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center border-2 border-dashed border-blue-500 overflow-hidden"
                                            onClick={() => fileInputRef.current.click()}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <CiImageOn className="text-neutral-400 text-4xl" />
                                            )}
                                        </div>
                                        {preview && (
                                            <IoCloseSharp
                                                className="absolute -top-2 -right-2 text-white bg-gray-800 rounded-full w-6 h-6 cursor-pointer border border-white"
                                                onClick={handleRemoveImage}
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            ref={fileInputRef}
                                        />
                                    </div>
                                    <span className="text-neutral-400 text-xs">Add a community photo</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Community Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:border-blue-500 outline-none"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:border-blue-500 outline-none resize-none"
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-500 transition"
                                    disabled={loading}
                                >
                                    {loading ? "Creating..." : "Create Community"}
                                </button>
                            </form>
                        </div>
                    </div>

                </>
            );
}

export default CommunityCreate;