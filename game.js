// API Base URL
const API_URL = 'http://localhost:3002/api';

// Game Class
class Game {
    constructor() {
        this.player = null;
        this.gameState = null;
        this.playerId = this.generatePlayerId();
        this.characters = [];
        this.missions = [];
        this.shopItems = [];
        this.achievements = [];
        this.currentMiniGame = null;
        this.currentMission = null;
        
        this.init();
        
    }

    generatePlayerId() {
        let id = localStorage.getItem('hackerTycoonPlayerId');
        if (!id) {
            id = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('hackerTycoonPlayerId', id);
        }
        return id;
    }

    async init() {
        await this.loadStaticData();
    }

    async loadStaticData() {
        try {
            const [charactersRes, shopRes, achievementsRes] = await Promise.all([
                fetch(`${API_URL}/characters`),
                fetch(`${API_URL}/shop`),
                fetch(`${API_URL}/achievements`)
            ]);

            this.characters = await charactersRes.json();
            this.shopItems = await shopRes.json();
            this.achievements = await achievementsRes.json();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error connecting to server');
        }
    }

    // STORY METHODS
    async loadStoryNode(nodeId) {
        try {
            const response = await fetch(`${API_URL}/story/${nodeId}`);
            if (!response.ok) {
                throw new Error('Story node not found');
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading story node:', error);
            return null;
        }
    }

    async makeStoryChoice(choiceIndex) {
        try {
            const response = await fetch(`${API_URL}/story/choice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: this.playerId,
                    currentNode: this.player.currentStoryNode || 'intro',
                    choiceIndex
                })
            });

            if (!response.ok) {
                const error = await response.json();
                this.showNotification(error.error || 'Cannot make this choice yet');
                return;
            }

            const data = await response.json();
            this.player = data.player;

            if (data.isEnding) {
                this.showStoryEnding(data.nextNode);
            } else {
                this.showStoryNode(data.nextNode);
            }
        } catch (error) {
            console.error('Error making story choice:', error);
            this.showNotification('Error making choice');
        }
    }

    showStoryNode(node) {
        const modal = document.getElementById('minigame-modal');
        const content = document.getElementById('minigame-content');
        
        content.innerHTML = `
            <div class="story-node">
                <h2 style="color: #00ff00; margin-bottom: 1rem;">${node.title}</h2>
                <p style="line-height: 1.8; margin-bottom: 2rem; color: #00dd00;">
                    ${node.text}
                </p>
                <div class="story-choices" id="story-choices-container">
                    ${node.choices.map((choice, index) => {
                        let disabled = false;
                        let reqText = '';
                        
                        if (choice.requirement) {
                            const req = choice.requirement;
                            if (req.type === 'level') {
                                disabled = this.player.level < req.value;
                                reqText = `Requires Level ${req.value}`;
                            } else if (req.type === 'money') {
                                disabled = this.player.money < req.value;
                                reqText = `Requires $${req.value}`;
                            } else if (req.type === 'heat') {
                                disabled = this.player.heat > req.max;
                                reqText = `Requires Heat below ${req.max}`;
                            } else if (req.type === 'skill') {
                                disabled = this.player.skills[req.skill] < req.value;
                                reqText = `Requires ${req.skill} ${req.value}`;
                            } else if (req.type === 'missions') {
                                const count = this.player.path.filter(p => p === req.missionType).length;
                                disabled = count < req.count;
                                reqText = `Requires ${req.count} ${req.missionType} missions`;
                            }
                        }
                        
                        return `
                            <button 
                                class="btn btn-secondary story-choice-btn" 
                                data-choice-index="${index}"
                                ${disabled ? 'disabled' : ''}
                                style="margin-bottom: 1rem; text-align: left; padding: 1rem;"
                            >
                                <div>${choice.text}</div>
                                ${reqText ? `<div style="font-size: 0.8rem; color: #ff6600; margin-top: 0.5rem;">${reqText}</div>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
                ${!node.ending ? '<button class="btn btn-small" id="close-story-btn" style="margin-top: 1rem; background: #333;">Close</button>' : ''}
            </div>
        `;
        
        modal.classList.add('active');
        
        // Add event listeners to choice buttons
        setTimeout(() => {
            document.querySelectorAll('.story-choice-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const choiceIndex = parseInt(btn.dataset.choiceIndex);
                    this.makeStoryChoice(choiceIndex);
                });
            });

            const closeBtn = document.getElementById('close-story-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeStoryModal();
                });
            }
        }, 100);
    }

    showStoryEnding(node) {
        const modal = document.getElementById('minigame-modal');
        const content = document.getElementById('minigame-content');
        
        const endingColor = node.endingType === 'good' ? '#00ff00' : 
                            node.endingType === 'bad' ? '#ff0000' : '#ffaa00';
        
        content.innerHTML = `
            <div class="story-ending" style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">
                    ${node.endingType === 'good' ? '🏆' : node.endingType === 'bad' ? '💀' : '⚖️'}
                </div>
                <h2 style="color: ${endingColor}; margin-bottom: 1rem; font-size: 2rem;">
                    ${node.title}
                </h2>
                <p style="line-height: 1.8; margin-bottom: 2rem; color: #00dd00; font-size: 1.1rem;">
                    ${node.text}
                </p>
                <div style="background: #1a1a1a; padding: 1.5rem; border-radius: 5px; border: 2px solid ${endingColor}; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Your Journey:</h3>
                    <p>Level: ${this.player.level}</p>
                    <p>Money: $${this.player.money}</p>
                    <p>Missions: ${this.player.missionsCompleted}</p>
                    <p>Achievements: ${this.player.achievements.length}</p>
                </div>
                <button 
                    class="btn btn-primary" 
                    id="ending-menu-btn"
                >
                    RETURN TO MENU
                </button>
            </div>
        `;
        
        modal.classList.add('active');

        setTimeout(() => {
            document.getElementById('ending-menu-btn').addEventListener('click', () => {
                this.closeStoryModal();
                this.showScreen('menu');
            });
        }, 100);
    }

    closeStoryModal() {
        const modal = document.getElementById('minigame-modal');
        modal.classList.remove('active');
    }

    async checkStoryProgress() {
        if (!this.player.currentStoryNode) {
            this.player.currentStoryNode = 'intro';
        }
        
        if (!this.player.storyPath || this.player.storyPath.length === 0) {
            const node = await this.loadStoryNode('intro');
            if (node) {
                this.showStoryNode(node);
            }
        }
    }

    // SCREEN NAVIGATION
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenName}-screen`).classList.add('active');

        if (screenName === 'characters') {
            this.renderCharacters();
        } else if (screenName === 'game') {
            this.renderGame();
        } else if (screenName === 'leaderboard') {
            this.loadLeaderboard();
        }
    }

    renderCharacters() {
        const grid = document.getElementById('character-grid');
        grid.innerHTML = this.characters.map(char => `
            <div class="character-card" onclick="game.selectCharacter('${char.id}')">
                <div class="character-avatar">${char.avatar}</div>
                <div class="character-name">${char.name}</div>
                <div class="character-skills">
                    <div class="skill-row">
                        <span>Hacking:</span>
                        <span class="skill-bar">${'█'.repeat(char.skills.hacking)}</span>
                    </div>
                    <div class="skill-row">
                        <span>Stealth:</span>
                        <span class="skill-bar">${'█'.repeat(char.skills.stealth)}</span>
                    </div>
                    <div class="skill-row">
                        <span>Social:</span>
                        <span class="skill-bar">${'█'.repeat(char.skills.social)}</span>
                    </div>
                    <div class="skill-row">
                        <span>Tech:</span>
                        <span class="skill-bar">${'█'.repeat(char.skills.tech)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async selectCharacter(characterId) {
        try {
            const response = await fetch(`${API_URL}/game/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ characterId, playerId: this.playerId })
            });

            const data = await response.json();
            this.player = data.player;
            this.gameState = data.gameState;
            
            // Initialize story state
            if (!this.player.currentStoryNode) {
                this.player.currentStoryNode = 'intro';
            }
            if (!this.player.storyPath) {
                this.player.storyPath = [];
            }

            this.showBackstory();
        } catch (error) {
            console.error('Error creating game:', error);
            this.showNotification('Error creating game');
        }
    }

    showBackstory() {
        const content = document.getElementById('backstory-content');
        content.innerHTML = `
            <div class="character-avatar">${this.player.avatar}</div>
            <h2>${this.player.name}</h2>
            <div class="panel" style="max-width: 600px;">
                <p style="line-height: 1.8; font-size: 1.1rem;">${this.player.backstory}</p>
            </div>
            <button class="btn btn-primary" onclick="game.startGame()">BEGIN JOURNEY</button>
        `;
        this.showScreen('backstory');
    }

    async startGame() {
        await this.loadMissions();
        this.showScreen('game');
        
        // Show initial story if it's a new game
        setTimeout(() => this.checkStoryProgress(), 1000);
    }

    async loadMissions() {
        try {
            const response = await fetch(`${API_URL}/missions?level=${this.player.level}`);
            this.missions = await response.json();
        } catch (error) {
            console.error('Error loading missions:', error);
        }
    }

    renderGame() {
        this.renderPlayerStats();
        this.renderMissions();
        this.renderShop();
        this.renderAchievements();
    }

    renderPlayerStats() {
        const stats = document.getElementById('player-stats');
        stats.innerHTML = `
            <div class="stats-header">
                <div class="player-info">
                    <div class="player-avatar">${this.player.avatar}</div>
                    <div class="player-details">
                        <h3>${this.player.name}</h3>
                        <p>Level ${this.player.level} | XP: ${this.player.xp}/100</p>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Money</div>
                        <div class="stat-value">$${this.player.money}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Energy</div>
                        <div class="stat-value ${this.player.energy < 30 ? 'danger' : ''}">
                            ${this.player.energy}/100
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Heat</div>
                        <div class="stat-value ${this.player.heat > 60 ? 'danger' : ''}">
                            ${this.player.heat}/100
                        </div>
                    </div>
                </div>
            </div>
            <div class="skills-row">
                <div>Hacking: ${this.player.skills.hacking}</div>
                <div>Stealth: ${this.player.skills.stealth}</div>
                <div>Social: ${this.player.skills.social}</div>
                <div>Tech: ${this.player.skills.tech}</div>
            </div>
        `;
    }

    renderMissions() {
    const list = document.getElementById('missions-list');
    list.innerHTML = this.missions.map(mission => `
        <div class="mission-card ${mission.type}">
            <div class="mission-header">
                <div>
                    <div class="mission-title">${mission.name}</div>
                    <div class="mission-story">${mission.story}</div>
                </div>
                <span class="mission-badge ${mission.type}">${mission.type.toUpperCase()}</span>
            </div>
            <div class="mission-details">
                <span>💰 $${mission.money} | ⚡ ${mission.xp}XP</span>
                <span>⚠️ ${mission.energy} Energy | 🔥 +${mission.heat} Heat</span>
            </div>
            <button 
                class="btn btn-small" 
                onclick="game.startMission(${mission.id})"
                ${this.player.energy < mission.energy ? 'disabled' : ''}
            >
                START MISSION
            </button>
        </div>
    `).join('') + `
        <button 
            class="btn btn-small" 
            style="margin-top: 1rem;"
            onclick="game.viewStory()"
        >
            📖 VIEW STORY
        </button>
        <button 
            class="btn btn-small" 
            onclick="game.rest()"
        >
            😴 REST (+30 Energy, -5 Heat)
        </button>
        <button 
            class="btn btn-small" 
            onclick="game.saveGame()"
        >
            💾 SAVE GAME
        </button>
    `;
    }
async viewStory() {
    console.log('viewStory called');
    if (!this.player) {
        this.showNotification('No active game');
        return;
    }
    
    const nodeId = this.player.currentStoryNode || 'intro';
    console.log('Loading story node:', nodeId);
    
    try {
        const response = await fetch(`${API_URL}/story/${nodeId}`);
        if (!response.ok) {
            throw new Error('Failed to load story');
        }
        
        const node = await response.json();
        console.log('Story node loaded:', node);
        this.showStoryNode(node);
    } catch (error) {
        console.error('Error:', error);
        this.showNotification('Error loading story');
    }
}
    renderShop() {
        const list = document.getElementById('shop-list');
        list.innerHTML = this.shopItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-footer">
                    <span class="shop-item-price">$${item.cost}</span>
                    <button 
                        class="btn btn-small" 
                        onclick="game.buyItem('${item.id}')"
                        ${this.player.inventory.includes(item.id) || this.player.money < item.cost ? 'disabled' : ''}
                    >
                        ${this.player.inventory.includes(item.id) ? 'OWNED' : 'BUY'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAchievements() {
        const list = document.getElementById('achievements-list');
        list.innerHTML = this.achievements.map(ach => {
            const unlocked = this.player.achievements.includes(ach.id);
            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon-small">${unlocked ? '✓' : '🔒'}</div>
                    <div class="achievement-details">
                        <div class="achievement-name">${ach.name}</div>
                        <div class="achievement-desc">${ach.desc}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    startMission(missionId) {
        this.currentMission = this.missions.find(m => m.id === missionId);
        if (!this.currentMission) return;

        const gameTypes = ['memory', 'typing', 'sequence'];
        const randomType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
        
        this.startMiniGame(randomType);
    }

    startMiniGame(type) {
        this.currentMiniGame = { type };
        const modal = document.getElementById('minigame-modal');
        modal.classList.add('active');

        if (type === 'memory') {
            this.renderMemoryGame();
        } else if (type === 'typing') {
            this.renderTypingGame();
        } else if (type === 'sequence') {
            this.renderSequenceGame();
        }
    }

    renderMemoryGame() {
        const content = document.getElementById('minigame-content');
        const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
        let userSequence = [];
        let showing = true;

        content.innerHTML = `
            <h3>🧠 MEMORY SEQUENCE</h3>
            <p style="text-align: center; margin-bottom: 2rem;">Remember the sequence!</p>
            <div class="memory-grid" id="memory-grid">
                ${[0, 1, 2, 3].map(n => `
                    <div class="memory-tile" data-index="${n}"></div>
                `).join('')}
            </div>
            <div style="text-align: center;" id="memory-status">Watch carefully...</div>
        `;

        // Show sequence
        sequence.forEach((index, i) => {
            setTimeout(() => {
                const tiles = document.querySelectorAll('.memory-tile');
                tiles[index].classList.add('active');
                setTimeout(() => tiles[index].classList.remove('active'), 500);
                
                if (i === sequence.length - 1) {
                    setTimeout(() => {
                        showing = false;
                        document.getElementById('memory-status').textContent = '0/' + sequence.length;
                    }, 600);
                }
            }, i * 700);
        });

        // Handle clicks
        setTimeout(() => {
            document.querySelectorAll('.memory-tile').forEach(tile => {
                tile.addEventListener('click', function() {
                    if (showing) return;
                    
                    const index = parseInt(this.dataset.index);
                    userSequence.push(index);
                    
                    this.classList.add('active');
                    setTimeout(() => this.classList.remove('active'), 200);

                    document.getElementById('memory-status').textContent = 
                        userSequence.length + '/' + sequence.length;

                    if (userSequence.length === sequence.length) {
                        const success = userSequence.every((v, i) => v === sequence[i]);
                        setTimeout(() => game.completeMiniGame(success), 500);
                    }
                });
            });
        }, sequence.length * 700 + 600);
    }

    renderTypingGame() {
        const content = document.getElementById('minigame-content');
        const words = ['FIREWALL', 'ENCRYPT', 'PROTOCOL', 'DATABASE', 'KERNEL', 'BACKDOOR', 'PAYLOAD'];
        const target = words[Math.floor(Math.random() * words.length)];
        let timeLeft = 10;

        content.innerHTML = `
            <h3>⌨️ TYPE THE CODE</h3>
            <div class="typing-target">${target}</div>
            <div class="typing-timer" id="typing-timer">${timeLeft}s</div>
            <input 
                type="text" 
                class="typing-input" 
                id="typing-input" 
                placeholder="Type here..."
                autocomplete="off"
            >
        `;

        const input = document.getElementById('typing-input');
        const timerDisplay = document.getElementById('typing-timer');
        
        input.focus();

        const timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft + 's';
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                const success = input.value.toUpperCase() === target;
                this.completeMiniGame(success);
            }
        }, 1000);

        input.addEventListener('input', () => {
            if (input.value.toUpperCase() === target) {
                clearInterval(timer);
                this.completeMiniGame(true);
            }
        });
    }

    renderSequenceGame() {
        const content = document.getElementById('minigame-content');
        const numbers = Array.from({ length: 12 }, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5);
        let current = 0;

        content.innerHTML = `
            <h3>🔢 CLICK IN ORDER</h3>
            <p style="text-align: center; margin-bottom: 2rem;">Click 1 to 12 in sequence</p>
            <div class="sequence-grid">
                ${numbers.map(n => `
                    <div class="sequence-tile" data-number="${n}">${n}</div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.sequence-tile').forEach(tile => {
            tile.addEventListener('click', function() {
                const number = parseInt(this.dataset.number);
                
                if (number === current + 1) {
                    current = number;
                    this.classList.add('completed');
                    
                    if (current === 12) {
                        setTimeout(() => game.completeMiniGame(true), 300);
                    }
                } else {
                    game.completeMiniGame(false);
                }
            });
        });
    }

    async completeMiniGame(success) {
        document.getElementById('minigame-modal').classList.remove('active');

        try {
            const response = await fetch(`${API_URL}/mission/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: this.playerId,
                    missionId: this.currentMission.id,
                    success,
                    miniGameSuccess: success
                })
            });

            const result = await response.json();
            this.player = result.player;

            if (result.succeeded) {
                this.showNotification(
                    `Mission Success! +$${result.rewards.money} +${result.rewards.xp}XP`
                );
                
                if (result.levelUp) {
                    setTimeout(() => {
                        this.showNotification(`Level Up! Now level ${result.newLevel}`);
                    }, 1500);
                }

                if (result.newAchievement) {
                    setTimeout(() => {
                        this.showNotification(`Achievement: ${result.newAchievement.name}!`);
                        
                        if (result.newAchievement.id === 'master') {
                            setTimeout(() => this.showVictory(), 2000);
                        }
                    }, 2000);
                }
            } else {
                this.showNotification('Mission Failed!');
            }

            if (result.gameOver) {
                setTimeout(() => this.showGameOver(), 2000);
            } else {
                await this.loadMissions();
                this.renderGame();
            }
        } catch (error) {
            console.error('Error completing mission:', error);
            this.showNotification('Error completing mission');
        }
    }

    async buyItem(itemId) {
        try {
            const response = await fetch(`${API_URL}/shop/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: this.playerId,
                    itemId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                this.showNotification(error.error);
                return;
            }

            const data = await response.json();
            this.player = data.player;
            this.showNotification(`Purchased ${data.item.name}!`);
            this.renderGame();
        } catch (error) {
            console.error('Error buying item:', error);
            this.showNotification('Error buying item');
        }
    }

    async rest() {
        try {
            const response = await fetch(`${API_URL}/game/rest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: this.playerId })
            });

            const data = await response.json();
            this.player = data.player;
            this.showNotification('Rested: +30 Energy, -5 Heat');
            this.renderGame();
        } catch (error) {
            console.error('Error resting:', error);
        }
    }

    async saveGame() {
        try {
            await fetch(`${API_URL}/game/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: this.playerId,
                    player: this.player,
                    gameState: this.gameState
                })
            });
            this.showNotification('Game Saved!');
        } catch (error) {
            console.error('Error saving game:', error);
            this.showNotification('Error saving game');
        }
    }

    async loadGame() {
        try {
            const response = await fetch(`${API_URL}/game/load/${this.playerId}`);
            
            if (!response.ok) {
                this.showNotification('No saved game found!');
                return;
            }

            const data = await response.json();
            this.player = data.player;
            this.gameState = data.gameState;
            
            // Initialize story state if missing
            if (!this.player.currentStoryNode) {
                this.player.currentStoryNode = 'intro';
            }
            if (!this.player.storyPath) {
                this.player.storyPath = [];
            }
            
            await this.loadMissions();
            this.showScreen('game');
            this.showNotification('Game Loaded!');
        } catch (error) {
            console.error('Error loading game:', error);
            this.showNotification('Error loading game');
        }
    }

    async loadLeaderboard() {
        try {
            const response = await fetch(`${API_URL}/leaderboard`);
            const leaderboard = await response.json();

            const content = document.getElementById('leaderboard-content');
            if (leaderboard.length === 0) {
                content.innerHTML = '<p style="text-align: center;">No players yet!</p>';
            } else {
                content.innerHTML = leaderboard.map((player, index) => `
                    <div class="leaderboard-item">
                        <div class="leaderboard-rank">${index + 1}</div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${player.name}</div>
                            <div class="leaderboard-stats">
                                Level ${player.level} | $${player.money} | ${player.missionsCompleted} missions
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    showVictory() {
        const stats = document.getElementById('victory-stats');
        stats.innerHTML = `
            <div class="panel" style="margin: 2rem 0;">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">Final Stats:</p>
                <p>Level: ${this.player.level}</p>
                <p>Money: $${this.player.money}</p>
                <p>Missions Completed: ${this.player.missionsCompleted}</p>
                <p>Achievements: ${this.player.achievements.length}/${this.achievements.length}</p>
            </div>
        `;
        this.showScreen('victory');
    }

    showGameOver() {
        const stats = document.getElementById('gameover-stats');
        stats.innerHTML = `
            <div class="panel" style="margin: 2rem 0;">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">You reached:</p>
<p>Level: ${this.player.level}</p>
<p>Money: $${this.player.money}</p>
<p>Missions Completed: ${this.player.missionsCompleted}</p>
</div>
`;
this.showScreen('gameover');
    }
    showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('active');

    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}
}
// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
game = new Game();
});
