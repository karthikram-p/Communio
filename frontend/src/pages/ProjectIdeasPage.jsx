import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const DOMAINS = [
  "Web",
  "AI",
  "Mobile",
  "Data Science",
  "Blockchain",
  "Game Dev",
  "IoT",
  "AR/VR",
  "Cybersecurity",
  "Cloud",
  "DevOps",
  "Healthcare",
  "Education",
  "Finance",
  "E-commerce",
  "Social",
  "Open Source",
  "Other"
];
const TABS = [
  { key: "all", label: "All Ideas" },
  { key: "mine", label: "My Ideas" },
];

function ProjectIdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDomain, setNewDomain] = useState(DOMAINS[0]);
  const [addLoading, setAddLoading] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [openIdeaId, setOpenIdeaId] = useState(null);
  const [domainFilter, setDomainFilter] = useState("");
  useEffect(() => {
    fetchAuthUser();
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [search, tab, authUser, domainFilter]);

  const fetchAuthUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setAuthUser(res.data);
      setSavedIds(res.data.savedIdeas || []);
    } catch {}
  };

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      let url = `/api/project-ideas?search=${encodeURIComponent(search)}`;
      if (tab === "mine" && authUser) url += `&author=${authUser._id}`;
      if (domainFilter) url += `&domain=${encodeURIComponent(domainFilter)}`;
      const res = await axios.get(url);
      setIdeas(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load project ideas");
    }
    setLoading(false);
  };

  const handleStar = async (id) => {
    const idea = ideas.find(i => i._id === id);
    if (idea.stars?.includes(authUser?._id)) {
      await axios.post(`/api/project-ideas/${id}/unstar`);
    } else {
      await axios.post(`/api/project-ideas/${id}/star`);
    }
    fetchIdeas();
  };

  const handleAddIdea = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axios.post("/api/project-ideas", { title: newTitle, description: newDesc, domain: newDomain });
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewDomain(DOMAINS[0]);
      fetchIdeas();
    } catch {
      alert("Failed to add idea");
    }
    setAddLoading(false);
  };

  // Filter ideas by search (title or description)
  let filteredIdeas = ideas.filter(idea => {
    const q = search.trim().toLowerCase();
    return (
      idea.title.toLowerCase().includes(q) ||
      idea.description.toLowerCase().includes(q)
    );
  });
  // Only show current user's ideas in 'My Ideas' tab
  if (tab === "mine" && authUser) {
    filteredIdeas = filteredIdeas.filter(idea => idea.author?._id === authUser._id);
  }
  // Filter by domain if selected (frontend filter for extra safety)
  if (domainFilter) {
    filteredIdeas = filteredIdeas.filter(idea => idea.domain === domainFilter);
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 mt-6 ml-0 md:ml-28">
      <h2 className="text-yellow-400 text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-10 text-center">Project Ideas</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex gap-2 sm:gap-4 justify-center md:justify-start flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 sm:px-5 py-2 rounded-lg font-semibold text-base sm:text-lg shadow ${tab === t.key ? "bg-yellow-400 text-black" : "bg-neutral-800 text-yellow-300 hover:bg-yellow-300 hover:text-black"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black px-3 sm:px-5 py-2 rounded-lg font-bold shadow hover:from-yellow-300 hover:to-yellow-500 transition self-center md:self-auto text-base sm:text-lg">
          <FaPlus /> Add Idea
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 sm:gap-4 mb-6 sm:mb-10">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search project ideas..."
          className="w-full px-3 sm:px-5 py-2 sm:py-3 rounded-lg border-2 border-yellow-300 bg-neutral-900 text-white text-base sm:text-lg focus:outline-none focus:border-yellow-400 shadow"
        />
        <select
          value={domainFilter}
          onChange={e => setDomainFilter(e.target.value)}
          className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg border-2 border-yellow-300 bg-neutral-900 text-yellow-300 text-base sm:text-lg focus:outline-none focus:border-yellow-400 shadow min-w-[120px] sm:min-w-[160px]"
        >
          <option value="">All Domains</option>
          {DOMAINS.map(domain => (
            <option key={domain} value={domain}>{domain}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-yellow-400 text-xl font-bold text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-lg font-semibold text-center">{error}</div>
      ) : (
        <ul className="space-y-8">
          {filteredIdeas.length === 0 ? (
            <li className="text-neutral-400 text-lg text-center">No project ideas found.</li>
          ) : (
            filteredIdeas.map(idea => (
              <li key={idea._id} className="bg-neutral-900 rounded-2xl p-6 shadow flex flex-col gap-4 border border-yellow-400/10 hover:border-yellow-400/40 transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <button onClick={() => setOpenIdeaId(idea._id)} className="text-left text-2xl font-bold text-yellow-300 hover:underline w-full md:w-auto mb-2 md:mb-0">
                    {idea.title}
                  </button>
                  <div className="flex items-center gap-4 justify-end md:justify-start">
                    <button onClick={() => handleStar(idea._id)} className={`flex items-center gap-1 ${idea.stars?.includes(authUser?._id) ? 'text-yellow-500' : 'text-yellow-400'} hover:text-yellow-300 text-xl font-bold`}>
                      <FaStar /> {idea.stars?.length || 0}
                    </button>
                  </div>
                </div>
                <p className="text-white text-lg leading-relaxed mb-2">{idea.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-base text-neutral-400 mb-2">
                  <span>By <Link to={`/profile/${idea.author?.username}`} className="text-yellow-300 hover:underline font-semibold">{idea.author?.fullName || idea.author?.username}</Link></span>
                  <span>· {new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
                <button onClick={() => setOpenIdeaId(idea._id)} className="text-blue-400 hover:underline text-base text-left font-semibold">View Thread & Discussion</button>
              </li>
            ))
          )}
        </ul>
      )}
      {/* Add Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form onSubmit={handleAddIdea} className="bg-neutral-900 rounded-xl p-8 shadow-xl flex flex-col gap-6 w-full max-w-lg border border-yellow-400/30">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Share a New Project Idea</h2>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Project Title"
              required
              className="px-5 py-3 rounded-lg border-2 border-yellow-300 bg-neutral-800 text-white text-lg focus:outline-none focus:border-yellow-400 shadow"
            />
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Describe your idea..."
              required
              rows={5}
              className="px-5 py-3 rounded-lg border-2 border-yellow-300 bg-neutral-800 text-white text-lg focus:outline-none focus:border-yellow-400 shadow"
            />
            <select
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              required
              className="px-5 py-3 rounded-lg border-2 border-yellow-300 bg-neutral-800 text-yellow-300 text-lg focus:outline-none focus:border-yellow-400 shadow"
            >
              {DOMAINS.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-lg bg-neutral-700 text-white font-semibold">Cancel</button>
              <button type="submit" disabled={addLoading} className="px-6 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition">
                {addLoading ? "Sharing..." : "Share Idea"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Discussion Modal */}
      {openIdeaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-neutral-900 rounded-xl p-8 shadow-xl w-full max-w-2xl relative border border-yellow-400/30">
            <button onClick={() => setOpenIdeaId(null)} className="absolute top-2 right-2 text-neutral-400 hover:text-white text-2xl">&times;</button>
            <ProjectIdeaDetailModal id={openIdeaId} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectIdeaDetailModal({ id }) {
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
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-2">{idea.title}</h1>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handleStar} className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300">
          <FaStar /> {idea.stars?.length || 0}
        </button>
      </div>
      <p className="text-white text-base mb-2">{idea.description}</p>
      <div className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
        <span>By <Link to={`/profile/${idea.author?.username}`} className="text-yellow-300 hover:underline">{idea.author?.fullName || idea.author?.username}</Link></span>
        <span>· {new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>
      <h2 className="text-lg font-semibold text-blue-400 mb-2">Discussion Thread</h2>
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
}

export default ProjectIdeasPage;
