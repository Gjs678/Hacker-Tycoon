const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let gameSaves = {};
let leaderboard = [];

// Character data
const characters = [
  {
    id: 'ghost',
    name: 'Ghost',
    avatar: '👻',
    backstory: 'Once a cybersecurity expert for a major corporation, you witnessed corruption at the highest levels. Now you use your skills to expose the truth and fight for justice in the digital underground.',
    skills: { hacking: 8, stealth: 9, social: 5, tech: 7 },
    startingMoney: 500
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    avatar: '🔥',
    backstory: 'A reformed black hat hacker who got caught and served time. You emerged with a new purpose: to use your notorious skills for good while staying one step ahead of your past.',
    skills: { hacking: 9, stealth: 6, social: 7, tech: 8 },
    startingMoney: 300
  },
  {
    id: 'cipher',
    name: 'Cipher',
    avatar: '🎭',
    backstory: 'A cryptography genius and social engineer. You can crack any code and manipulate anyone. Your mysterious past is encrypted even from yourself.',
    skills: { hacking: 7, stealth: 7, social: 9, tech: 6 },
    startingMoney: 400
  },
  {
    id: 'nexus',
    name: 'Nexus',
    avatar: '⚡',
    backstory: 'Born into the digital age, you learned to code before you could write. A prodigy hacker with bleeding-edge tech knowledge and unlimited potential.',
    skills: { hacking: 6, stealth: 5, social: 6, tech: 10 },
    startingMoney: 600
  }
];

// Mission data
const missions = [
  { id: 1, name: 'Scan Network', type: 'legal', difficulty: 1, xp: 20, money: 50, energy: 10, heat: 0, story: 'A local business needs a security audit.' },
  { id: 2, name: 'Debug Code', type: 'legal', difficulty: 1, xp: 15, money: 40, energy: 8, heat: 0, story: 'Help a startup fix their website bugs.' },
  { id: 3, name: 'Steal Data', type: 'illegal', difficulty: 2, xp: 40, money: 150, energy: 20, heat: 15, story: 'A rival wants competitor secrets.' },
  { id: 4, name: 'Plant Backdoor', type: 'illegal', difficulty: 3, xp: 60, money: 300, energy: 30, heat: 25, story: 'Install persistent access to a corporate server.' },
  { id: 5, name: 'Teach Workshop', type: 'legal', difficulty: 2, xp: 30, money: 100, energy: 15, heat: 0, story: 'Share your knowledge with aspiring hackers.' },
  { id: 6, name: 'DDoS Attack', type: 'illegal', difficulty: 4, xp: 80, money: 500, energy: 40, heat: 35, story: 'Take down a website for an anonymous client.' },
  { id: 7, name: 'Ransomware Deploy', type: 'illegal', difficulty: 5, xp: 100, money: 800, energy: 50, heat: 45, story: 'Deploy ransomware to a corporate target.' },
  { id: 8, name: 'Security Consulting', type: 'legal', difficulty: 3, xp: 50, money: 200, energy: 25, heat: 0, story: 'Advise a company on their security posture.' },
  { id: 9, name: 'Phishing Campaign', type: 'illegal', difficulty: 3, xp: 55, money: 250, energy: 28, heat: 20, story: 'Launch a targeted phishing attack.' },
  { id: 10, name: 'White Hat Pentest', type: 'legal', difficulty: 4, xp: 70, money: 350, energy: 35, heat: 0, story: 'Perform authorized penetration testing.' }
];

// Shop items
const shopItems = [
  { id: 'vpn', name: 'Premium VPN', cost: 200, effect: 'stealth', value: 2, desc: 'Reduces heat generation by 20%' },
  { id: 'toolkit', name: 'Advanced Toolkit', cost: 300, effect: 'hacking', value: 2, desc: 'Improves hacking success rate' },
  { id: 'ai', name: 'AI Assistant', cost: 500, effect: 'tech', value: 3, desc: 'Boosts all skills slightly' },
  { id: 'social', name: 'Deep Fake Kit', cost: 250, effect: 'social', value: 2, desc: 'Better social engineering' },
  { id: 'proxy', name: 'Proxy Network', cost: 400, effect: 'stealth', value: 3, desc: 'Advanced anonymity tools' },
  { id: 'exploit', name: 'Zero-Day Exploit', cost: 1000, effect: 'hacking', value: 4, desc: 'Powerful hacking tool' }
];

// Achievements
const achievements = [
  { id: 'first', name: 'First Steps', desc: 'Complete your first mission', level: 1 },
  { id: 'cash', name: 'Money Maker', desc: 'Earn $5000', money: 5000 },
  { id: 'pro', name: 'Professional', desc: 'Reach level 10', level: 10 },
  { id: 'master', name: 'Master Hacker', desc: 'Reach level 15', level: 15 },
  { id: 'legal', name: 'White Hat', desc: 'Complete 10 legal missions', legalCount: 10 },
  { id: 'illegal', name: 'Black Hat', desc: 'Complete 10 illegal missions', illegalCount: 10 }
];

// Story System
const storyNodes = {
  intro: {
    id: 'intro',
    title: 'The Beginning',
    text: 'You sit in your dimly lit apartment, the glow of multiple monitors illuminating your face. A mysterious message appears on your screen...',
    choices: [
      { text: 'Investigate the message', next: 'mysterious_contact', requirement: null },
      { text: 'Ignore it and continue your work', next: 'solo_path', requirement: null }
    ]
  },
  mysterious_contact: {
    id: 'mysterious_contact',
    title: 'The Contact',
    text: '"I know who you are," the message reads. "I have a proposition. The corporation you used to work for is hiding something big. Help me expose them, and we both benefit."',
    choices: [
      { text: 'Accept the offer - Fight the corporation', next: 'vigilante_path', requirement: null },
      { text: 'Report this to authorities', next: 'lawful_path', requirement: null },
      { text: 'Blackmail them instead', next: 'criminal_path', requirement: { type: 'skill', skill: 'social', value: 7 } }
    ]
  },
  solo_path: {
    id: 'solo_path',
    title: 'The Lone Wolf',
    text: 'You decide to forge your own path. No mysterious contacts, no grand conspiracies. Just you and your skills against the world.',
    choices: [
      { text: 'Focus on legal consulting work', next: 'freelancer_path', requirement: null },
      { text: 'Build your own hacking empire', next: 'empire_path', requirement: { type: 'level', value: 5 } }
    ]
  },
  vigilante_path: {
    id: 'vigilante_path',
    title: 'Digital Vigilante',
    text: 'You join forces with the mysterious contact. Together, you begin exposing corporate corruption. But the deeper you dig, the more dangerous it becomes...',
    choices: [
      { text: 'Continue the investigation', next: 'vigilante_deep', requirement: { type: 'missions', missionType: 'illegal', count: 3 } },
      { text: 'This is too dangerous, back out', next: 'redemption_path', requirement: null }
    ]
  },
  lawful_path: {
    id: 'lawful_path',
    title: 'White Hat Guardian',
    text: 'You report the contact to the authorities and offer your skills to help them. They recruit you as a consultant to fight cybercrime.',
    choices: [
      { text: 'Accept the position', next: 'government_agent', requirement: { type: 'heat', max: 20 } },
      { text: 'Work independently', next: 'freelancer_path', requirement: null }
    ]
  },
  criminal_path: {
    id: 'criminal_path',
    title: 'Dark Web King',
    text: 'You use the information to blackmail both sides. Money flows in, but so does the heat. Law enforcement is getting closer...',
    choices: [
      { text: 'Go deeper into the criminal underworld', next: 'crime_lord', requirement: { type: 'money', value: 2000 } },
      { text: 'Try to escape and disappear', next: 'fugitive_path', requirement: null }
    ]
  },
  freelancer_path: {
    id: 'freelancer_path',
    title: 'Independent Consultant',
    text: 'You build a reputation as a skilled, ethical hacker. Companies pay top dollar for your services, and you sleep well at night.',
    choices: [
      { text: 'Start your own security firm', next: 'business_owner', requirement: { type: 'level', value: 10 } },
      { text: 'Continue solo work', next: 'master_freelancer', requirement: null }
    ]
  },
  empire_path: {
    id: 'empire_path',
    title: 'Building an Empire',
    text: 'You start recruiting other hackers, building a network of skilled individuals. Your collective grows in power and influence.',
    choices: [
      { text: 'Focus on legal services', next: 'tech_company', requirement: { type: 'money', value: 3000 } },
      { text: 'Control the dark web markets', next: 'crime_syndicate', requirement: { type: 'missions', missionType: 'illegal', count: 10 } }
    ]
  },
  vigilante_deep: {
    id: 'vigilante_deep',
    title: 'The Conspiracy Unfolds',
    text: 'You discover the corporation is involved in illegal surveillance of millions. You have the evidence to bring them down, but they know you have it.',
    choices: [
      { text: 'Release everything to the public', next: 'hero_ending', requirement: null },
      { text: 'Negotiate a deal', next: 'compromise_ending', requirement: null }
    ]
  },
  redemption_path: {
    id: 'redemption_path',
    title: 'Second Chances',
    text: 'You step back from the dangerous work and focus on making amends. Some doors close, but others open.',
    choices: [
      { text: 'Teach others ethical hacking', next: 'mentor_ending', requirement: { type: 'level', value: 12 } },
      { text: 'Work with law enforcement', next: 'reformed_ending', requirement: null }
    ]
  },
  government_agent: {
    id: 'government_agent',
    title: 'Federal Cyber Agent',
    text: 'You work with government agencies to stop cybercriminals. The pay is steady, the work is meaningful, but bureaucracy is frustrating.',
    choices: [
      { text: 'Rise through the ranks', next: 'agency_director', requirement: { type: 'level', value: 15 } },
      { text: 'Return to private sector', next: 'freelancer_path', requirement: null }
    ]
  },
  crime_lord: {
    id: 'crime_lord',
    title: 'Criminal Mastermind',
    text: 'You control a vast criminal network. Money pours in, but paranoia grows. Every shadow could be law enforcement.',
    choices: [
      { text: 'Keep expanding your empire', next: 'kingpin_ending', requirement: { type: 'heat', max: 70 } },
      { text: 'Try to leave this life behind', next: 'escape_attempt', requirement: null }
    ]
  },
  fugitive_path: {
    id: 'fugitive_path',
    title: 'On the Run',
    text: 'You try to disappear, changing identities and locations. Freedom comes at a price - constant vigilance and isolation.',
    choices: [
      { text: 'Hide forever', next: 'hidden_ending', requirement: null },
      { text: 'Turn yourself in', next: 'surrender_ending', requirement: null }
    ]
  },
  business_owner: {
    id: 'business_owner',
    title: 'Security Firm CEO',
    text: 'Your company is thriving. You employ dozens of ethical hackers and protect major corporations from cyber threats.',
    choices: [
      { text: 'Go public with your company', next: 'tycoon_ending', requirement: { type: 'money', value: 5000 } }
    ]
  },
  master_freelancer: {
    id: 'master_freelancer',
    title: 'Legend of the Trade',
    text: 'Your reputation precedes you. Companies worldwide seek your expertise. You work on your terms.',
    choices: [
      { text: 'Retire at the top', next: 'retirement_ending', requirement: { type: 'level', value: 15 } }
    ]
  },
  tech_company: {
    id: 'tech_company',
    title: 'Tech Startup Success',
    text: 'Your collective evolves into a legitimate tech company. Investors are interested, and the future is bright.',
    choices: [
      { text: 'Accept venture capital', next: 'unicorn_ending', requirement: { type: 'money', value: 4000 } }
    ]
  },
  crime_syndicate: {
    id: 'crime_syndicate',
    title: 'Dark Web Emperor',
    text: 'Your syndicate controls major dark web operations. Power is absolute, but so are the risks.',
    choices: [
      { text: 'Maintain your empire', next: 'emperor_ending', requirement: { type: 'heat', max: 80 } }
    ]
  },
  // ENDINGS
  hero_ending: {
    id: 'hero_ending',
    title: 'THE HERO',
    text: 'You release all evidence to the media. The corporation falls, its executives face justice. You become a symbol of digital resistance. Some call you a hero, others a vigilante. But you know you did the right thing.',
    ending: true,
    endingType: 'good'
  },
  compromise_ending: {
    id: 'compromise_ending',
    title: 'THE NEGOTIATOR',
    text: 'You negotiate a deal: the corporation reforms its practices, compensates victims, and you walk away with enough money to live comfortably. Not perfect, but pragmatic.',
    ending: true,
    endingType: 'neutral'
  },
  mentor_ending: {
    id: 'mentor_ending',
    title: 'THE MENTOR',
    text: 'You establish an academy teaching ethical hacking. Your students go on to protect systems worldwide. Your legacy is education and positive change.',
    ending: true,
    endingType: 'good'
  },
  reformed_ending: {
    id: 'reformed_ending',
    title: 'THE REFORMED',
    text: 'Working with law enforcement, you help catch cybercriminals. Your past gives you unique insight. Redemption is found in service.',
    ending: true,
    endingType: 'good'
  },
  agency_director: {
    id: 'agency_director',
    title: 'THE DIRECTOR',
    text: 'You rise to lead a federal cyber agency. From this position, you shape national cybersecurity policy and protect millions.',
    ending: true,
    endingType: 'good'
  },
  kingpin_ending: {
    id: 'kingpin_ending',
    title: 'THE KINGPIN',
    text: 'You rule the digital underworld, but at what cost? Wealth beyond measure, but constant paranoia. You won, but did you really?',
    ending: true,
    endingType: 'bad'
  },
  escape_attempt: {
    id: 'escape_attempt',
    title: 'THE ESCAPEE',
    text: 'You try to leave, but your past catches up. Federal agents raid your location. The empire falls, and you face decades in prison.',
    ending: true,
    endingType: 'bad'
  },
  hidden_ending: {
    id: 'hidden_ending',
    title: 'THE GHOST',
    text: 'You successfully disappear. Years pass in various countries under different names. Free, but forever alone. Was it worth it?',
    ending: true,
    endingType: 'neutral'
  },
  surrender_ending: {
    id: 'surrender_ending',
    title: 'THE PENITENT',
    text: 'You turn yourself in. After serving your time, you emerge changed. A second chance at life, this time doing things right.',
    ending: true,
    endingType: 'neutral'
  },
  tycoon_ending: {
    id: 'tycoon_ending',
    title: 'THE TYCOON',
    text: 'Your security company goes public. You become a billionaire. From underground hacker to respected CEO - the ultimate success story.',
    ending: true,
    endingType: 'good'
  },
  retirement_ending: {
    id: 'retirement_ending',
    title: 'THE LEGEND',
    text: 'You retire at the peak of your career. Your name is whispered with respect in hacker circles. A life well-lived on your own terms.',
    ending: true,
    endingType: 'good'
  },
  unicorn_ending: {
    id: 'unicorn_ending',
    title: 'THE ENTREPRENEUR',
    text: 'Your startup becomes a unicorn valued at over $1 billion. From hacker to tech entrepreneur - you changed the world legitimately.',
    ending: true,
    endingType: 'good'
  },
  emperor_ending: {
    id: 'emperor_ending',
    title: 'THE EMPEROR',
    text: 'You control the dark web. Unlimited power and wealth. But one day, everyone falls. The question is when, not if.',
    ending: true,
    endingType: 'bad'
  }
};

// Routes

// Get all characters
app.get('/api/characters', (req, res) => {
  res.json(characters);
});

// Get missions filtered by player level
app.get('/api/missions', (req, res) => {
  const playerLevel = parseInt(req.query.level) || 1;
  const availableMissions = missions.filter(m => m.difficulty <= Math.floor(playerLevel / 2) + 2);
  res.json(availableMissions);
});

// Get shop items
app.get('/api/shop', (req, res) => {
  res.json(shopItems);
});

// Get achievements
app.get('/api/achievements', (req, res) => {
  res.json(achievements);
});

// Start new game
app.post('/api/game/new', (req, res) => {
  const { characterId, playerId } = req.body;
  const character = characters.find(c => c.id === characterId);
  
  if (!character) {
    return res.status(400).json({ error: 'Invalid character' });
  }

  const newGame = {
    player: {
      ...character,
      level: 1,
      xp: 0,
      energy: 100,
      money: character.startingMoney,
      heat: 0,
      inventory: [],
      achievements: [],
      missionsCompleted: 0,
      legalCount: 0,
      illegalCount: 0,
      path: [],
      currentStoryNode: 'intro',
      storyPath: []
    },
    gameState: {
      turn: 0,
      lastMission: null,
      startTime: Date.now()
    }
  };

  gameSaves[playerId] = newGame;
  res.json(newGame);
});

// Save game
app.post('/api/game/save', (req, res) => {
  const { playerId, player, gameState } = req.body;
  
  if (!playerId) {
    return res.status(400).json({ error: 'Player ID required' });
  }

  gameSaves[playerId] = { player, gameState };
  res.json({ message: 'Game saved successfully' });
});

// Load game
app.get('/api/game/load/:playerId', (req, res) => {
  const { playerId } = req.params;
  const save = gameSaves[playerId];

  if (!save) {
    return res.status(404).json({ error: 'No save found' });
  }

  res.json(save);
});

// Complete mission
app.post('/api/mission/complete', (req, res) => {
  const { playerId, missionId, success, miniGameSuccess } = req.body;
  
  const mission = missions.find(m => m.id === missionId);
  if (!mission) {
    return res.status(400).json({ error: 'Invalid mission' });
  }

  const save = gameSaves[playerId];
  if (!save) {
    return res.status(400).json({ error: 'No game found' });
  }

  const player = save.player;
  
  // Calculate success rate
  const baseSuccess = 0.5 + (player.skills.hacking * 0.05);
  const miniGameBonus = miniGameSuccess ? 0.3 : 0;
  const finalSuccess = Math.min(0.95, baseSuccess + miniGameBonus);
  const succeeded = success !== undefined ? success : Math.random() < finalSuccess;

  let result = { succeeded, levelUp: false, newLevel: player.level };

  if (succeeded) {
    const newXp = player.xp + mission.xp;
    const levelUp = Math.floor(newXp / 100) > player.level - 1;
    
    player.xp = newXp;
    player.money += mission.money;
    player.heat = Math.min(100, player.heat + mission.heat);
    player.energy = Math.max(0, player.energy - mission.energy);
    player.missionsCompleted += 1;
    player.path.push(mission.type);

    if (mission.type === 'legal') player.legalCount += 1;
    if (mission.type === 'illegal') player.illegalCount += 1;

    if (levelUp) {
      player.level += 1;
      player.energy = 100;
      player.xp = newXp % 100;
      result.levelUp = true;
      result.newLevel = player.level;
    }

    // Check achievements
    achievements.forEach(ach => {
      if (!player.achievements.includes(ach.id)) {
        let unlocked = false;
        if (ach.level && player.level >= ach.level) unlocked = true;
        if (ach.money && player.money >= ach.money) unlocked = true;
        if (ach.legalCount && player.legalCount >= ach.legalCount) unlocked = true;
        if (ach.illegalCount && player.illegalCount >= ach.illegalCount) unlocked = true;

        if (unlocked) {
          player.achievements.push(ach.id);
          result.newAchievement = ach;
        }
      }
    });

    result.rewards = {
      xp: mission.xp,
      money: mission.money
    };
  } else {
    player.energy = Math.max(0, player.energy - mission.energy);
    player.heat = Math.min(100, player.heat + mission.heat * 0.5);
  }

  save.gameState.turn += 1;
  save.gameState.lastMission = missionId;

  result.player = player;
  result.gameOver = player.heat >= 80;

  res.json(result);
});

// Buy item
app.post('/api/shop/buy', (req, res) => {
  const { playerId, itemId } = req.body;
  
  const item = shopItems.find(i => i.id === itemId);
  if (!item) {
    return res.status(400).json({ error: 'Invalid item' });
  }

  const save = gameSaves[playerId];
  if (!save) {
    return res.status(400).json({ error: 'No game found' });
  }

  const player = save.player;

  if (player.inventory.includes(itemId)) {
    return res.status(400).json({ error: 'Item already owned' });
  }

  if (player.money < item.cost) {
    return res.status(400).json({ error: 'Not enough money' });
  }

  player.money -= item.cost;
  player.inventory.push(itemId);
  player.skills[item.effect] += item.value;

  res.json({ player, item });
});

// Rest to restore energy
app.post('/api/game/rest', (req, res) => {
  const { playerId } = req.body;
  
  const save = gameSaves[playerId];
  if (!save) {
    return res.status(400).json({ error: 'No game found' });
  }

  save.player.energy = Math.min(100, save.player.energy + 30);
  save.player.heat = Math.max(0, save.player.heat - 5);

  res.json({ player: save.player });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const board = Object.entries(gameSaves)
    .map(([id, save]) => ({
      playerId: id,
      name: save.player.name,
      level: save.player.level,
      money: save.player.money,
      missionsCompleted: save.player.missionsCompleted
    }))
    .sort((a, b) => b.level - a.level || b.money - a.money)
    .slice(0, 10);

  res.json(board);
});

// STORY ROUTES

// Test route to verify story system
app.get('/api/story/test', (req, res) => {
  res.json({
    message: 'Story system is working!',
    availableNodes: Object.keys(storyNodes),
    totalNodes: Object.keys(storyNodes).length
  });
});

// Get current story node
app.get('/api/story/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  console.log('Fetching story node:', nodeId); // Debug log
  
  const node = storyNodes[nodeId];
  
  if (!node) {
    console.log('Story node not found:', nodeId); // Debug log
    return res.status(404).json({ error: 'Story node not found' });
  }
  
  console.log('Story node found:', node); // Debug log
  res.json(node);
});

// Make story choice
app.post('/api/story/choice', (req, res) => {
  const { playerId, currentNode, choiceIndex } = req.body;
  
  const save = gameSaves[playerId];
  if (!save) {
    return res.status(400).json({ error: 'No game found' });
  }

  const node = storyNodes[currentNode];
  if (!node || !node.choices[choiceIndex]) {
    return res.status(400).json({ error: 'Invalid choice' });
  }

  const choice = node.choices[choiceIndex];
  const player = save.player;

  // Check requirements
  if (choice.requirement) {
    const req = choice.requirement;
    let canProceed = true;

    if (req.type === 'level' && player.level < req.value) canProceed = false;
    if (req.type === 'money' && player.money < req.value) canProceed = false;
    if (req.type === 'heat' && req.max && player.heat > req.max) canProceed = false;
    if (req.type === 'skill' && player.skills[req.skill] < req.value) canProceed = false;
    if (req.type === 'missions') {
      const count = player.path.filter(p => p === req.missionType).length;
      if (count < req.count) canProceed = false;
    }

    if (!canProceed) {
      return res.status(400).json({ error: 'Requirements not met', requirement: req });
    }
  }

  // Update player story progress
  if (!player.storyPath) player.storyPath = [];
  player.storyPath.push(currentNode);
  player.currentStoryNode = choice.next;

  const nextNode = storyNodes[choice.next];
  
  res.json({ 
    nextNode,
    player,
    isEnding: nextNode.ending || false
  });
});

// Get player's story progress
app.get('/api/story/progress/:playerId', (req, res) => {
  const { playerId } = req.params;
  const save = gameSaves[playerId];
  
  if (!save) {
    return res.status(404).json({ error: 'No game found' });
  }

  res.json({
    currentNode: save.player.currentStoryNode || 'intro',
    storyPath: save.player.storyPath || []
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hacker Tycoon server running on http://localhost:${PORT}`);
  console.log(`📖 Story system initialized with ${Object.keys(storyNodes).length} nodes`);
});