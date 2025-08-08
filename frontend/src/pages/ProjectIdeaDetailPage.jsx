import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaRegBookmark, FaBookmark } from "react-icons/fa";
import axios from "axios";

const ProjectIdeaDetailPage = () => {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [thread, setThread] = useState([]);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchIdea();
    fetchThread();
    // eslint-disable-next-line
  }, [id]);

  const fetchIdea = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/project-ideas/${id}`);
      setIdea(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load idea");
    }
    setLoading(false);
  };

  const fetchThread = async () => {
    try {
      const res = await axios.get(`/api/project-ideas/${id}/thread`);
      setThread(res.data);
    } catch {
      setThread([]);
    }
  };

  const handleStar = async () => {
    await axios.post(`/api/project-ideas/${id}/star`);
    fetchIdea();
  };

  const handleSave = async () => {
    await axios.post(`/api/project-ideas/${id}/save`);
    fetchIdea();
  };

  const handleAddMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setPosting(true);
    await axios.post(`/api/project-ideas/${id}/thread`, { message });
    setMessage("");
    setPosting(false);
    fetchThread();
  };

  if (loading) return <div className="text-yellow-400">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!idea) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-yellow-400 mb-2">{idea.title}</h1>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handleStar} className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300">
          <FaStar /> {idea.stars?.length || 0}
        </button>
        <button onClick={handleSave} className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300">
          {idea.saves?.length ? <FaBookmark /> : <FaRegBookmark />} {idea.saves?.length || 0}
        </button>
      </div>
      <p className="text-white text-base mb-2">{idea.description}</p>
      <div className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
        <span>By <Link to={`/profile/${idea.author?.username}`} className="text-yellow-300 hover:underline">{idea.author?.fullName || idea.author?.username}</Link></span>
        <span>· {new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>
      <h2 className="text-xl font-semibold text-blue-400 mb-2">Discussion Thread</h2>
      <ul className="space-y-3 mb-4">
        {thread.length === 0 ? (
          <li className="text-neutral-400">No messages yet.</li>
        ) : (
          thread.map(msg => (
            <li key={msg._id} className="bg-neutral-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/profile/${msg.author?.username}`} className="text-yellow-300 font-semibold hover:underline">{msg.author?.fullName || msg.author?.username}</Link>
                <span className="text-xs text-neutral-400">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-white text-base">{msg.message}</p>
            </li>
          ))
        )}
      </ul>
      <form onSubmit={handleAddMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Add a message..."
          className="flex-1 px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:border-blue-400"
        />
        <button type="submit" disabled={posting} className="bg-blue-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-blue-300 transition">{posting ? "Sending..." : "Send"}</button>
      </form>
    </div>
  );
};

export default ProjectIdeaDetailPage;
