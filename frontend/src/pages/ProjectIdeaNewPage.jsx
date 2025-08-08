import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectIdeaNewPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/project-ideas", { title, description });
      navigate("/project-ideas");
    } catch (err) {
      setError("Failed to share idea");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Share a New Project Idea</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Project Title"
          required
          className="px-4 py-2 rounded-lg border border-yellow-300 focus:outline-none focus:border-yellow-400"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your idea..."
          required
          rows={6}
          className="px-4 py-2 rounded-lg border border-yellow-300 focus:outline-none focus:border-yellow-400"
        />
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
        >
          {loading ? "Sharing..." : "Share Idea"}
        </button>
      </form>
    </div>
  );
};

export default ProjectIdeaNewPage;
