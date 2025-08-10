import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const TeamFormationPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myTeams, setMyTeams] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    competitionName: "",
    description: "",
    domain: [],
    teamSize: 2,
    prizeMoney: "",
    deadline: "",
    platform: "",
    link: ""
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [search, setSearch] = useState("");
  const [prizeFrom, setPrizeFrom] = useState("");
  const [prizeTo, setPrizeTo] = useState("");
  const [authUser, setAuthUser] = useState(null);

  // Edit modal state
  const [editTeam, setEditTeam] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  const allDomains = [
    "Web", "AI", "Blockchain", "Mobile", "Game", "Fintech", "Health", "Education", "IoT", "AR/VR", "Cloud", "DevOps", "Security", "Data Science", "Robotics", "Embedded", "Automotive", "Aerospace", "Agritech", "Legaltech", "E-commerce", "Social", "Other"
  ];
  const [domainFilter, setDomainFilter] = useState("");

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line
  }, [myTeams, search, prizeFrom, prizeTo, domainFilter]);

  useEffect(() => {
    async function fetchAuthUser() {
      try {
        const res = await axios.get("/api/auth/me");
        setAuthUser(res.data);
      } catch {
        setAuthUser(null);
      }
    }
    fetchAuthUser();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/teams?";
      if (myTeams && authUser) url += `author=${authUser._id}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (prizeFrom) url += `prizeFrom=${prizeFrom}&`;
      if (prizeTo) url += `prizeTo=${prizeTo}&`;
      if (domainFilter) url += `domain=${domainFilter}&`;
      const res = await axios.get(url);
      setTeams(res.data);
    } catch (err) {
      setError("Failed to fetch teams");
    }
    setLoading(false);
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    try {
      await axios.post("/api/teams", {
        ...form,
        domain: form.domain,
        teamSize: Number(form.teamSize),
        prizeMoney: parseFloat(form.prizeMoney),
        deadline: form.deadline,
        platform: form.platform,
        link: form.link
      });
      setShowAdd(false);
      setForm({ competitionName: "", description: "", domain: [], teamSize: 2, prizeMoney: "", deadline: "", platform: "", link: "" });
      fetchTeams();
    } catch (err) {
      setAddError(err?.response?.data?.error || "Failed to add team");
    }
    setAdding(false);
  };

  const handleEditClick = (team) => {
    setEditTeam(team);
    setEditForm({
      competitionName: team.competitionName,
      description: team.description,
      domain: Array.isArray(team.domain) ? team.domain : [],
      teamSize: team.teamSize,
      prizeMoney: team.prizeMoney,
      deadline: team.deadline ? team.deadline.slice(0, 10) : "",
      platform: team.platform || "",
      link: team.link || ""
    });
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    setEditError("");
    try {
      await axios.patch(`/api/teams/${editTeam._id}/edit`, {
        ...editForm,
        domain: editForm.domain,
        teamSize: Number(editForm.teamSize),
        prizeMoney: parseFloat(editForm.prizeMoney),
        deadline: editForm.deadline,
        platform: editForm.platform,
        link: editForm.link
      });
      setEditTeam(null);
      setEditForm(null);
      fetchTeams();
    } catch (err) {
      setEditError(err?.response?.data?.error || "Failed to edit team");
    }
    setEditing(false);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team post?")) return;
    try {
      await axios.delete(`/api/teams/${teamId}`);
      fetchTeams();
    } catch (err) {
      alert("Failed to delete team");
    }
  };

  return (
  <div className="min-h-screen w-full flex flex-col items-center bg-black pt-16 md:pt-0">
      <div className="w-full md:ml-72 px-4 md:px-8 py-10 rounded-3xl shadow-2xl border border-blue-900">
  <h2 className="text-2xl font-bold mb-8 text-center text-blue-700 tracking-tight drop-shadow-lg font-sans">Team Formation</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8 w-full">
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold transition col-span-1"
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? "Cancel" : "Add Team"}
          </button>
          <button
            className={`w-full px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold transition col-span-1 ${myTeams ? "" : "opacity-70"}`}
            onClick={() => setMyTeams((v) => !v)}
          >
            My Teams
          </button>
          <select
            className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 col-span-1 bg-black text-white"
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
          >
            <option value="">All Domains</option>
            {allDomains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 col-span-2"
            placeholder="Search by title or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-4 col-span-2 items-center justify-end">
            <div className="col-span-2 w-full flex flex-col md:flex-row gap-6 mt-2">
              <div className="w-full flex flex-col gap-4">
                <label className="block text-base font-semibold text-white mb-1 font-sans">Prize Money Range</label>
                <div className="flex gap-4 w-full">
                  <input
                    id="prizeFrom"
                    type="number"
                    min={0}
                    step="any"
                    className="w-full border px-6 py-3 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-black text-white"
                    placeholder="From"
                    value={prizeFrom}
                    onChange={e => setPrizeFrom(e.target.value.replace(/[^0-9.]/g, ""))}
                  />
                  <input
                    id="prizeTo"
                    type="number"
                    min={0}
                    step="any"
                    className="w-full border px-6 py-3 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-black text-white"
                    placeholder="To"
                    value={prizeTo}
                    onChange={e => setPrizeTo(e.target.value.replace(/[^0-9.]/g, ""))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {showAdd && (
          <form className="mb-8 p-6 border rounded-xl bg-black text-white shadow-lg w-full" onSubmit={handleAddTeam}>
            <div className="mb-3">
              <label className="block text-base font-semibold mb-1 text-blue-300 font-sans">Competition Name</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.competitionName}
                onChange={e => setForm(f => ({ ...f, competitionName: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-base font-semibold mb-1 text-blue-300 font-sans">Description</label>
              <textarea
                className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-base font-semibold mb-1 text-blue-300 font-sans">Team Size</label>
              <input
                type="number"
                min={2}
                max={20}
                className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.teamSize}
                onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              {/* Prize Money form section */}
              <label htmlFor="prizeMoney" className="block text-base font-semibold mb-1 text-blue-300 font-sans">Prize Money</label>
              <input
                id="prizeMoney"
                type="number"
                min={0}
                step="any"
                className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.prizeMoney}
                onChange={e => setForm(f => ({ ...f, prizeMoney: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="Enter Prize Money"
                aria-label="Enter Prize Money"
              />
            </div>
            <div className="mb-3">
              <label className="block text-base font-semibold mb-1 text-blue-300 font-sans">Deadline</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full border px-3 py-2 rounded-lg bg-neutral-900 text-white"
                value={form.deadline || ""}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-base font-semibold mb-1 text-blue-300 font-sans">Platform</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.platform || ""}
                onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="block text-base font-semibold mb-1 text-blue-300 font-sans">Link (if any)</label>
              <input
                type="url"
                className="w-full border px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.link || ""}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="block text-base font-semibold mb-1 text-blue-300 font-sans">Domains (select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {allDomains.map(domain => (
                  <button
                    key={domain}
                    type="button"
                    className={`px-3 py-1 rounded-full border transition font-semibold text-sm font-sans ${form.domain.includes(domain) ? "bg-blue-500 text-white border-blue-500" : "bg-neutral-900 text-blue-300 border-blue-300"}`}
                    onClick={() => {
                      setForm(f => f.domain.includes(domain)
                        ? { ...f, domain: f.domain.filter(d => d !== domain) }
                        : { ...f, domain: [...f.domain, domain] });
                    }}
                  >
                    {domain}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">Click to select/unselect domains. You can choose multiple.</div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold transition font-sans"
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Team"}
            </button>
            {addError && <div className="text-red-500 mt-2">{addError}</div>}
          </form>
        )}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-8 w-full">
            {teams.length === 0 ? (
              <div className="text-gray-500 text-center">No teams found.</div>
            ) : (
              teams.map((team) => (
                <div key={team._id} className={`border-2 border-blue-700 rounded-2xl p-8 bg-black text-white shadow-xl transition-all duration-300 w-full flex flex-col gap-4 ${team.disabled ? "opacity-50" : "hover:scale-[1.01]"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col md:flex-row md:items-center w-full justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-xl text-blue-400 font-sans">{team.competitionName}</span>
                        {team.disabled && <span className="text-xs text-red-500">Disabled</span>}
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        {team.author && (
                          <button
                            onClick={() => window.location.href = `http://localhost:3000/profile/${team.author.username}`}
                            className="text-sm font-semibold px-3 py-1 rounded-full border border-blue-700 bg-blue-700 text-white shadow hover:bg-blue-800 transition font-sans"
                          >
                            {team.author.fullName || team.author.username}
                          </button>
                        )}
                        {team.author?._id === authUser?._id && (
                          <div className="flex gap-2">
                            <button className="px-2 py-1 rounded border border-blue-700 bg-yellow-400 text-white shadow hover:bg-yellow-500 text-xs font-semibold font-sans" onClick={() => handleEditClick(team)}>Edit</button>
                            <button className="px-2 py-1 rounded border border-blue-700 bg-red-500 text-white shadow hover:bg-red-600 text-xs font-semibold font-sans" onClick={() => handleDelete(team._id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(team.domain) && team.domain.map((d) => (
                      <span key={d} className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs font-semibold border border-blue-700 font-sans">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-300 mb-2">
                    <div className="flex flex-wrap gap-6 w-full">
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-400">Team Size</span>
                        <span className="font-bold text-blue-300 text-base font-sans">{team.teamSize}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-400">Prize Money</span>
                        <span className="font-bold text-green-400 text-base font-sans">₹{team.prizeMoney}</span>
                      </div>
                      {team.deadline && (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-400">Deadline</span>
                          <span className="font-bold text-red-400 text-lg">{new Date(team.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {team.platform && (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-400">Platform</span>
                          <span className="font-bold text-blue-300 text-lg">{team.platform}</span>
                        </div>
                      )}
                      {team.link && (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-400">Link</span>
                          <a href={team.link} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 underline text-lg">Visit</a>
                        </div>
                      )}
                    </div>
                  </div>
                    {/* Contact Team Lead button for direct messaging */}
                    {team.author && team.author._id !== authUser?._id && (
                      <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold"
                        onClick={() => window.location.href = `http://localhost:3000/direct/${team.author.username}`}
                      >
                        Contact Team Lead
                      </button>
                    )}
                </div>
              ))
            )}
          </div>
        )}
        {editTeam && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center overflow-auto">
            <form className="bg-black text-white rounded-xl p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onSubmit={handleEditSubmit}>
              <h3 className="text-xl font-bold mb-4 text-blue-700">Edit Team</h3>
              {/* Same fields as add form, but for editForm */}
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Competition Name</label>
                <input type="text" className="w-full border px-3 py-2 rounded-lg" value={editForm.competitionName} onChange={e => setEditForm(f => ({ ...f, competitionName: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Description</label>
                <textarea className="w-full border px-3 py-2 rounded-lg" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Team Size</label>
                <input type="number" min={2} max={20} className="w-full border px-3 py-2 rounded-lg" value={editForm.teamSize} onChange={e => setEditForm(f => ({ ...f, teamSize: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Prize Money (₹)</label>
                <input type="number" min={0} step="any" className="w-full border px-3 py-2 rounded-lg" value={editForm.prizeMoney} onChange={e => setEditForm(f => ({ ...f, prizeMoney: e.target.value.replace(/[^0-9.]/g, "") }))} />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Deadline</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border px-3 py-2 rounded-lg bg-neutral-900 text-white"
                  value={editForm.deadline || ""}
                  onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Platform</label>
                <input type="text" className="w-full border px-3 py-2 rounded-lg" value={editForm.platform || ""} onChange={e => setEditForm(f => ({ ...f, platform: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Link (if any)</label>
                <input type="url" className="w-full border px-3 py-2 rounded-lg" value={editForm.link || ""} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1 text-blue-300">Domains (select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {allDomains.map(domain => (
                    <button
                      key={domain}
                      type="button"
                      className={`px-3 py-1 rounded-full border transition font-semibold text-sm ${editForm.domain.includes(domain) ? "bg-blue-500 text-white border-blue-500" : "bg-neutral-900 text-blue-300 border-blue-300"}`}
                      onClick={() => setEditForm(f => f.domain.includes(domain) ? { ...f, domain: f.domain.filter(d => d !== domain) } : { ...f, domain: [...f.domain, domain] })}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">Click to select/unselect domains. You can choose multiple.</div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold transition" disabled={editing}>{editing ? "Saving..." : "Save Changes"}</button>
                <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 font-semibold transition" onClick={() => setEditTeam(null)}>Cancel</button>
              </div>
              {editError && <div className="text-red-500 mt-2">{editError}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamFormationPage;
