// Edit team post (full details)
export const editTeamPost = async (req, res) => {
  try {
    const team = await TeamFormation.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (String(team.author) !== String(req.user._id))
      return res.status(403).json({ error: "Not authorized" });
    const {
      competitionName,
      description,
      domain,
      teamSize,
      prizeMoney,
      deadline,
      platform,
      link,
    } = req.body;
    team.competitionName = competitionName;
    team.description = description;
    team.domain = domain;
    team.teamSize = teamSize;
    team.prizeMoney = prizeMoney;
    team.deadline = deadline;
    team.platform = platform;
    team.link = link;
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import TeamFormation from "../models/teamFormation.model.js";

// Create a new team formation post
export const createTeam = async (req, res) => {
  try {
    const { competitionName, description, domain, teamSize, prizeMoney } =
      req.body;
    const team = new TeamFormation({
      competitionName,
      description,
      domain,
      teamSize,
      prizeMoney,
      author: req.user._id,
      members: [req.user._id],
    });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all team formation posts (with optional domain filter)
export const getTeams = async (req, res) => {
  try {
    const { search, author, my, prizeFrom, prizeTo, domain } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { competitionName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (prizeFrom || prizeTo) {
      query.prizeMoney = {};
      if (prizeFrom) query.prizeMoney.$gte = Number(prizeFrom);
      if (prizeTo) query.prizeMoney.$lte = Number(prizeTo);
    }
    if (domain) {
      query.domain = { $in: [domain] };
    }
    if (author) query.author = author;
    if (my && req.user) query.author = req.user._id;
    const teams = await TeamFormation.find(query)
      .populate("author", "_id username profileImg fullName")
      .populate("members", "username profileImg fullName")
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit team size
export const editTeamSize = async (req, res) => {
  try {
    const { teamSize } = req.body;
    const team = await TeamFormation.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (String(team.author) !== String(req.user._id))
      return res.status(403).json({ error: "Not authorized" });
    team.teamSize = teamSize;
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Disable post
export const disableTeam = async (req, res) => {
  try {
    const team = await TeamFormation.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (String(team.author) !== String(req.user._id))
      return res.status(403).json({ error: "Not authorized" });
    team.disabled = true;
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join team
export const joinTeam = async (req, res) => {
  try {
    const team = await TeamFormation.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (team.disabled)
      return res.status(400).json({ error: "Team is disabled" });
    if (team.members.length >= team.teamSize)
      return res.status(400).json({ error: "Team is full" });
    if (team.members.includes(req.user._id))
      return res.status(400).json({ error: "Already joined" });
    team.members.push(req.user._id);
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove member (author only)
export const removeMember = async (req, res) => {
  try {
    const team = await TeamFormation.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (String(team.author) !== String(req.user._id))
      return res.status(403).json({ error: "Not authorized" });
    team.members = team.members.filter(
      (m) => String(m) !== String(req.body.userId)
    );
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get team by id
export const getTeamById = async (req, res) => {
  try {
    const team = await TeamFormation.findById(req.params.id)
      .populate("author", "username profileImg fullName")
      .populate("members", "username profileImg fullName");
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete team post
export const deleteTeamPost = async (req, res) => {
  try {
    const team = await TeamFormation.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (String(team.author) !== String(req.user._id))
      return res.status(403).json({ error: "Not authorized" });
    await team.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
