#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <fstream>
#include <sstream>
#include <ctime>
#include <cstdlib>
#include <algorithm>

using namespace std;

// ============================================================================
// STRUCTURES
// ============================================================================

struct Mission {
    int id;
    string name;
    int difficulty;
    int xpReward;
    int creditsReward;
    int reqLevel;
    string type; // "legal" or "illegal"
    int heat;
    vector<string> paths;
    
    Mission(int i, string n, int d, int xp, int cr, int rl, string t, int h, vector<string> p)
        : id(i), name(n), difficulty(d), xpReward(xp), creditsReward(cr), 
          reqLevel(rl), type(t), heat(h), paths(p) {}
};

struct ShopItem {
    string id;
    string name;
    int price;
    int successBonus;
    int xpBonus;
    int heatReduction;
    string type;
    
    ShopItem(string i, string n, int p, int sb, int xb, int hr, string t)
        : id(i), name(n), price(p), successBonus(sb), xpBonus(xb), 
          heatReduction(hr), type(t) {}
};

struct Achievement {
    string id;
    string name;
    string description;
    string icon;
    
    Achievement(string i, string n, string d, string ic)
        : id(i), name(n), description(d), icon(ic) {}
};

struct RandomEvent {
    string name;
    string effect;
    int value;
    string type;
    string message;
    
    RandomEvent(string n, string e, int v, string t, string m)
        : name(n), effect(e), value(v), type(t), message(m) {}
};

struct Player {
    string username;
    string characterType;
    int level;
    int xp;
    int xpToLevel;
    int credits;
    int reputation;
    int heat;
    int maxHeat;
    float xpMultiplier;
    map<string, int> skills;
    vector<string> equipment;
    vector<string> inventory;
    vector<int> completedMissions;
    vector<string> achievements;
    int storyProgress;
    string storyPath;
    bool seenBackstory;
    int totalEarned;
    int lowHeatMissions;
    int missionStreak;
    bool doubleRewardNext;
    bool gameWon;
    bool gameLost;
    time_t createdAt;
    time_t lastPlayed;
    
    Player() : level(1), xp(0), xpToLevel(100), credits(0), reputation(0), 
               heat(0), maxHeat(0), xpMultiplier(1.0), storyProgress(0), 
               storyPath("intro"), seenBackstory(false), totalEarned(0),
               lowHeatMissions(0), missionStreak(0), doubleRewardNext(false),
               gameWon(false), gameLost(false) {
        skills["hacking"] = 1;
        skills["cryptography"] = 1;
        skills["networking"] = 1;
        skills["programming"] = 1;
        createdAt = time(0);
        lastPlayed = time(0);
    }
};

// ============================================================================
// GAME DATA
// ============================================================================

class GameData {
public:
    static vector<Mission> getMissions() {
        vector<Mission> missions;
        
        // Legal missions
        missions.push_back(Mission(1, "Security Audit", 1, 40, 80, 1, "legal", 0, {"all"}));
        missions.push_back(Mission(2, "Penetration Testing", 1, 50, 100, 1, "legal", 0, {"all"}));
        missions.push_back(Mission(3, "Bug Bounty Program", 2, 80, 150, 2, "legal", 0, {"all"}));
        missions.push_back(Mission(4, "Ethical Hacking Course", 2, 90, 120, 2, "legal", 0, {"all"}));
        missions.push_back(Mission(5, "Corporate IT Consulting", 3, 150, 300, 4, "legal", 0, {"all"}));
        missions.push_back(Mission(6, "Cybersecurity Conference", 3, 120, 200, 5, "legal", 0, {"all"}));
        missions.push_back(Mission(7, "Government Security Contract", 4, 250, 600, 7, "legal", 5, {"all"}));
        missions.push_back(Mission(8, "White Hat Consulting", 3, 140, 250, 6, "legal", 0, {"all"}));
        missions.push_back(Mission(9, "Security Training Program", 2, 100, 180, 3, "legal", 0, {"all"}));
        
        // Illegal missions
        missions.push_back(Mission(20, "Phishing Attack", 1, 60, 150, 1, "illegal", 10, {"all"}));
        missions.push_back(Mission(21, "SQL Injection", 2, 100, 250, 1, "illegal", 15, {"all"}));
        missions.push_back(Mission(22, "DDoS Campaign", 2, 120, 350, 2, "illegal", 20, {"all"}));
        missions.push_back(Mission(23, "Ransomware Deployment", 3, 200, 600, 3, "illegal", 30, {"all"}));
        missions.push_back(Mission(24, "Zero-Day Exploit", 4, 300, 1200, 5, "illegal", 35, {"all"}));
        missions.push_back(Mission(25, "Corporate Espionage", 4, 350, 1800, 6, "illegal", 40, {"all"}));
        missions.push_back(Mission(26, "Government Database Breach", 5, 600, 3500, 8, "illegal", 50, {"all"}));
        missions.push_back(Mission(27, "Cryptocurrency Heist", 5, 800, 6000, 10, "illegal", 55, {"all"}));
        missions.push_back(Mission(28, "Military Network Infiltration", 5, 1000, 8000, 12, "illegal", 70, {"all"}));
        missions.push_back(Mission(29, "Black Market Trading", 3, 180, 500, 4, "illegal", 25, {"all"}));
        
        // Path specific missions
        missions.push_back(Mission(30, "Shadow Network Infiltration", 3, 200, 400, 4, "illegal", 20, {"stealth"}));
        missions.push_back(Mission(31, "Silent Data Exfiltration", 4, 350, 800, 7, "illegal", 25, {"stealth"}));
        missions.push_back(Mission(32, "Ghost Protocol Operation", 5, 600, 2000, 9, "illegal", 30, {"stealth"}));
        
        missions.push_back(Mission(40, "Public Server Takedown", 3, 220, 700, 4, "illegal", 40, {"aggressive"}));
        missions.push_back(Mission(41, "Mass System Breach", 4, 450, 1500, 7, "illegal", 50, {"aggressive"}));
        missions.push_back(Mission(42, "Digital Warfare Campaign", 5, 900, 4000, 9, "illegal", 65, {"aggressive"}));
        
        missions.push_back(Mission(50, "Balanced Reconnaissance", 3, 210, 550, 4, "illegal", 25, {"neutral"}));
        missions.push_back(Mission(51, "Strategic Asset Acquisition", 4, 400, 1100, 7, "illegal", 28, {"neutral"}));
        missions.push_back(Mission(52, "Calculated Strike Operation", 5, 750, 3200, 9, "illegal", 32, {"neutral"}));
        
        return missions;
    }
    
    static vector<ShopItem> getShopItems() {
        vector<ShopItem> items;
        items.push_back(ShopItem("vpn", "Military VPN", 500, 5, 0, 5, "tool"));
        items.push_back(ShopItem("laptop", "Elite Laptop", 1000, 10, 10, 0, "gear"));
        items.push_back(ShopItem("exploit", "Zero-Day Kit", 2000, 15, 0, 0, "tool"));
        items.push_back(ShopItem("server", "Offshore Server", 3000, 20, 0, 10, "gear"));
        items.push_back(ShopItem("ai", "AI Assistant", 5000, 25, 20, 0, "tool"));
        items.push_back(ShopItem("quantum", "Quantum Processor", 10000, 35, 30, 15, "gear"));
        return items;
    }
    
    static vector<Achievement> getAchievements() {
        vector<Achievement> achievements;
        achievements.push_back(Achievement("first_mission", "First Steps", "Complete first mission", "🎯"));
        achievements.push_back(Achievement("level_5", "Rising Star", "Reach level 5", "⭐"));
        achievements.push_back(Achievement("level_10", "Expert Hacker", "Reach level 10", "💎"));
        achievements.push_back(Achievement("level_15", "Elite Operative", "Reach level 15", "👑"));
        achievements.push_back(Achievement("rich", "Money Maker", "Earn 5000 credits total", "💰"));
        achievements.push_back(Achievement("notorious", "Most Wanted", "Reach 80 heat", "🔥"));
        achievements.push_back(Achievement("ghost", "Ghost", "Complete 5 missions with heat below 30", "👻"));
        achievements.push_back(Achievement("unstoppable", "Unstoppable", "10 mission streak", "⚡"));
        achievements.push_back(Achievement("shopaholic", "Shopaholic", "Buy all equipment", "🛍️"));
        achievements.push_back(Achievement("skilled", "Master", "Any skill to level 10", "📊"));
        achievements.push_back(Achievement("survivor", "Close Call", "Survive with 90+ heat", "🎲"));
        achievements.push_back(Achievement("legendary", "Legendary", "Complete 20 missions", "🏆"));
        return achievements;
    }
    
    static vector<RandomEvent> getRandomEvents() {
        vector<RandomEvent> events;
        events.push_back(RandomEvent("Laptop Crashed!", "credits", -50, "bad", "💻 Laptop crashed! -50 ¢"));
        events.push_back(RandomEvent("Found Vulnerability", "doubleReward", 1, "good", "🎯 Vulnerability! Next rewards x2!"));
        events.push_back(RandomEvent("Police Raid Warning", "heat", 20, "bad", "🚨 Police nearby! Heat +20"));
        events.push_back(RandomEvent("Hacker Gift", "credits", 200, "good", "🎁 Anonymous gift: +200 ¢!"));
        events.push_back(RandomEvent("Equipment Upgrade", "xpBonus", 50, "good", "⚡ Equipment upgrade! +50 XP"));
        events.push_back(RandomEvent("Informant Tip", "heat", -15, "good", "🕵️ Informant helped! Heat -15"));
        events.push_back(RandomEvent("Hardware Failure", "credits", -100, "bad", "⚠️ Hardware failure! -100 ¢"));
        events.push_back(RandomEvent("Reputation Boost", "reputation", 50, "good", "⭐ Reputation +50!"));
        events.push_back(RandomEvent("Security Breach", "heat", 15, "bad", "🔔 Detected! Heat +15"));
        events.push_back(RandomEvent("Crypto Windfall", "credits", 500, "good", "💰 Bitcoin windfall! +500 ¢"));
        events.push_back(RandomEvent("VPN Compromised", "heat", 25, "bad", "🔓 VPN compromised! Heat +25"));
        return events;
    }
};

// ============================================================================
// GAME SERVER CLASS
// ============================================================================

class GameServer {
private:
    map<string, Player> players;
    vector<Mission> missions;
    vector<ShopItem> shopItems;
    vector<Achievement> achievements;
    vector<RandomEvent> randomEvents;
    
public:
    GameServer() {
        missions = GameData::getMissions();
        shopItems = GameData::getShopItems();
        achievements = GameData::getAchievements();
        randomEvents = GameData::getRandomEvents();
        srand(time(0));
    }
    
    // Helper: Get available missions for player
    vector<Mission> getAvailableMissions(const Player& player) {
        vector<Mission> available;
        for (const auto& mission : missions) {
            bool pathMatch = false;
            for (const auto& path : mission.paths) {
                if (path == "all" || path == player.storyPath) {
                    pathMatch = true;
                    break;
                }
            }
            if (pathMatch) {
                available.push_back(mission);
            }
        }
        return available;
    }
    
    // Helper: Calculate heat reduction from equipment
    int calculateHeatReduction(const Player& player) {
        int reduction = 0;
        
        // Character bonus
        if (player.characterType == "ghost") reduction += 10;
        
        // Equipment bonuses
        for (const auto& itemId : player.equipment) {
            for (const auto& item : shopItems) {
                if (item.id == itemId) {
                    reduction += item.heatReduction;
                    break;
                }
            }
        }
        
        return reduction;
    }
    
    // Helper: Check achievements
    vector<Achievement> checkAchievements(Player& player) {
        vector<Achievement> newAchievements;
        
        for (const auto& ach : achievements) {
            // Check if already unlocked
            bool hasAchievement = false;
            for (const auto& unlocked : player.achievements) {
                if (unlocked == ach.id) {
                    hasAchievement = true;
                    break;
                }
            }
            
            if (hasAchievement) continue;
            
            // Check conditions
            bool unlocked = false;
            if (ach.id == "first_mission") unlocked = player.completedMissions.size() >= 1;
            else if (ach.id == "level_5") unlocked = player.level >= 5;
            else if (ach.id == "level_10") unlocked = player.level >= 10;
            else if (ach.id == "level_15") unlocked = player.level >= 15;
            else if (ach.id == "rich") unlocked = player.totalEarned >= 5000;
            else if (ach.id == "notorious") unlocked = player.heat >= 80;
            else if (ach.id == "ghost") unlocked = player.lowHeatMissions >= 5;
            else if (ach.id == "unstoppable") unlocked = player.missionStreak >= 10;
            else if (ach.id == "shopaholic") unlocked = player.equipment.size() >= 6;
            else if (ach.id == "skilled") {
                for (const auto& skill : player.skills) {
                    if (skill.second >= 10) {
                        unlocked = true;
                        break;
                    }
                }
            }
            else if (ach.id == "survivor") unlocked = player.maxHeat >= 90;
            else if (ach.id == "legendary") unlocked = player.completedMissions.size() >= 20;
            
            if (unlocked) {
                player.achievements.push_back(ach.id);
                newAchievements.push_back(ach);
            }
        }
        
        return newAchievements;
    }
    
    // Helper: Trigger random event (15% chance)
    RandomEvent* triggerRandomEvent() {
        if ((rand() % 100) < 15) {
            int index = rand() % randomEvents.size();
            return &randomEvents[index];
        }
        return nullptr;
    }
    
    // Create player
    string createPlayer(string username, string characterType) {
        if (players.find(username) != players.end()) {
            return "ERROR: Player already exists";
        }
        
        Player newPlayer;
        newPlayer.username = username;
        newPlayer.characterType = characterType;
        
        // Apply character bonuses
        if (characterType == "ghost") {
            newPlayer.skills["hacking"] += 2;
        } else if (characterType == "cipher") {
            newPlayer.skills["cryptography"] += 2;
            newPlayer.xpMultiplier = 1.15;
        } else if (characterType == "rebel") {
            newPlayer.skills["networking"] += 2;
            newPlayer.reputation = 50;
        } else if (characterType == "architect") {
            newPlayer.skills["programming"] += 2;
            newPlayer.credits = 100;
        }
        
        players[username] = newPlayer;
        
        cout << "✓ Player created: " << username << " (" << characterType << ")" << endl;
        return "SUCCESS: Player created";
    }
    
    // Start mission
    string startMission(string username, int missionId, int successRate) {
        if (players.find(username) == players.end()) {
            return "ERROR: Player not found";
        }
        
        Player& player = players[username];
        
        if (player.gameLost) {
            return "ERROR: Game Over! You were caught!";
        }
        
        if (player.gameWon) {
            return "ERROR: You already won!";
        }
        
        // Find mission
        vector<Mission> availableMissions = getAvailableMissions(player);
        Mission* mission = nullptr;
        for (auto& m : availableMissions) {
            if (m.id == missionId) {
                mission = &m;
                break;
            }
        }
        
        if (!mission) {
            return "ERROR: Mission not found";
        }
        
        if (player.level < mission->reqLevel) {
            return "ERROR: Level too low";
        }
        
        // Check if already completed
        for (int id : player.completedMissions) {
            if (id == missionId) {
                return "ERROR: Already completed";
            }
        }
        
        // Mission success check
        int roll = rand() % 100;
        bool success = roll < successRate;
        
        // Random event
        RandomEvent* event = triggerRandomEvent();
        
        if (success) {
            int xpGained = mission->xpReward;
            int creditsGained = mission->creditsReward;
            
            // Double reward
            if (player.doubleRewardNext) {
                xpGained *= 2;
                creditsGained *= 2;
                player.doubleRewardNext = false;
            }
            
            // XP multiplier
            xpGained = (int)(xpGained * player.xpMultiplier);
            
            // Equipment XP bonus
            for (const auto& itemId : player.equipment) {
                for (const auto& item : shopItems) {
                    if (item.id == itemId && item.xpBonus > 0) {
                        xpGained = (int)(xpGained * (1.0 + item.xpBonus / 100.0));
                    }
                }
            }
            
            player.xp += xpGained;
            player.credits += creditsGained;
            player.totalEarned += creditsGained;
            player.reputation += mission->difficulty * 10;
            player.completedMissions.push_back(missionId);
            player.missionStreak++;
            
            // Heat
            int heatGain = max(0, mission->heat - calculateHeatReduction(player));
            player.heat = min(100, player.heat + heatGain);
            if (player.heat > player.maxHeat) {
                player.maxHeat = player.heat;
            }
            
            if (player.heat < 30) {
                player.lowHeatMissions++;
            }
            
            // Item drop (30% chance)
            if ((rand() % 100) < 30) {
                string items[] = {"VPN Key", "Exploit Kit", "Crypto Wallet", "Firewall Bypass", "Root Token"};
                player.inventory.push_back(items[rand() % 5]);
            }
            
            // Level up
            bool leveledUp = false;
            int levelsGained = 0;
            while (player.xp >= player.xpToLevel) {
                player.level++;
                levelsGained++;
                player.xp -= player.xpToLevel;
                player.xpToLevel = (int)(player.xpToLevel * 1.5);
                leveledUp = true;
                
                if (player.level % 3 == 0) {
                    player.storyProgress++;
                }
                
                if (player.level >= 20) {
                    player.gameWon = true;
                }
            }
            
            // Check achievements
            vector<Achievement> newAch = checkAchievements(player);
            
            // Apply random event
            if (event) {
                if (event->effect == "credits") {
                    player.credits = max(0, player.credits + event->value);
                } else if (event->effect == "heat") {
                    player.heat = max(0, min(100, player.heat + event->value));
                } else if (event->effect == "doubleReward") {
                    player.doubleRewardNext = true;
                } else if (event->effect == "xpBonus") {
                    player.xp += event->value;
                } else if (event->effect == "reputation") {
                    player.reputation += event->value;
                }
            }
            
            // Check game over
            if (player.heat >= 100) {
                player.gameLost = true;
            }
            
            player.lastPlayed = time(0);
            
            stringstream ss;
            ss << "SUCCESS: Mission completed! +" << xpGained << " XP, +" << creditsGained << " credits";
            if (leveledUp) ss << " | LEVEL UP to " << player.level << "!";
            if (player.gameWon) ss << " | YOU WON THE GAME!";
            if (player.gameLost) ss << " | GAME OVER - Heat reached 100!";
            if (event) ss << " | EVENT: " << event->message;
            
            cout << "✓ " << username << " completed: " << mission->name << " (Heat: " << player.heat << ")" << endl;
            
            return ss.str();
        } else {
            player.reputation -= 5;
            player.heat += 10;
            player.missionStreak = 0;
            
            if (player.heat >= 100) {
                player.gameLost = true;
            }
            
            player.lastPlayed = time(0);
            
            cout << "✗ " << username << " failed: " << mission->name << endl;
            return "FAIL: Mission failed! Security detected you.";
        }
    }
    
    // Reduce heat (costs 300 credits)
    string reduceHeat(string username) {
        if (players.find(username) == players.end()) {
            return "ERROR: Player not found";
        }
        
        Player& player = players[username];
        
        if (player.credits < 300) {
            return "ERROR: Need 300 credits";
        }
        
        player.credits -= 300;
        player.heat = max(0, player.heat - 20);
        
        return "SUCCESS: Heat reduced by 20!";
    }
    
    // Buy item
    string buyItem(string username, string itemId) {
        if (players.find(username) == players.end()) {
            return "ERROR: Player not found";
        }
        
        Player& player = players[username];
        
        // Find item
        ShopItem* item = nullptr;
        for (auto& i : shopItems) {
            if (i.id == itemId) {
                item = &i;
                break;
            }
        }
        
        if (!item) {
            return "ERROR: Item not found";
        }
        
        // Check if already owned
        for (const auto& owned : player.equipment) {
            if (owned == itemId) {
                return "ERROR: Already owned";
            }
        }
        
        if (player.credits < item->price) {
            return "ERROR: Not enough credits";
        }
        
        player.credits -= item->price;
        player.equipment.push_back(itemId);
        
        checkAchievements(player);
        
        cout << "✓ " << username << " bought: " << item->name << endl;
        return "SUCCESS: " + item->name + " purchased!";
    }
    
    // Upgrade skill
    string upgradeSkill(string username, string skillName) {
        if (players.find(username) == players.end()) {
            return "ERROR: Player not found";
        }
        
        Player& player = players[username];
        
        if (player.skills.find(skillName) == player.skills.end()) {
            return "ERROR: Invalid skill";
        }
        
        int cost = player.skills[skillName] * 500;
        
        if (player.credits < cost) {
            return "ERROR: Not enough credits";
        }
        
        player.credits -= cost;
        player.skills[skillName]++;
        
        checkAchievements(player);
        
        cout << "✓ " << username << " upgraded " << skillName << " to " << player.skills[skillName] << endl;
        
        stringstream ss;
        ss << "SUCCESS: " << skillName << " upgraded to level " << player.skills[skillName];
        return ss.str();
    }
    
    // Story choice
    string storyChoice(string username, string choice) {
        if (players.find(username) == players.end()) {
            return "ERROR: Player not found";
        }
        
        Player& player = players[username];
        
        int xpReward = 0, creditsReward = 0, repReward = 0;
        
        if (choice == "stealth") {
            xpReward = 100; creditsReward = 200; repReward = 10;
        } else if (choice == "aggressive") {
            xpReward = 150; creditsReward = 100; repReward = 20;
        } else {
            xpReward = 125; creditsReward = 150; repReward = 15;
        }
        
        xpReward = (int)(xpReward * player.xpMultiplier);
        
        player.xp += xpReward;
        player.credits += creditsReward;
        player.reputation += repReward;
        player.storyPath = choice;
        
        // Level up check
        bool leveledUp = false;
        while (player.xp >= player.xpToLevel) {
            player.level++;
            player.xp -= player.xpToLevel;
            player.xpToLevel = (int)(player.xpToLevel * 1.5);
            leveledUp = true;
            
            if (player.level % 3 == 0) {
                player.storyProgress++;
            }
        }
        
        cout << "✓ " << username << " chose path: " << choice << endl;
        
        stringstream ss;
        ss << "SUCCESS: Path chosen! +" << xpReward << " XP, +" << creditsReward << " credits";
        if (leveledUp) ss << " | LEVEL UP!";
        return ss.str();
    }
    
    // Get player stats
    string getPlayerStats(string username) {
        if (players.find(username) == players.end()) {
            return "ERROR: Player not found";
        }
        
        Player& player = players[username];
        stringstream ss;
        
        ss << "\n=== PLAYER STATS ===" << endl;
        ss << "Name: " << player.username << endl;
        ss << "Character: " << player.characterType << endl;
        ss << "Level: " << player.level << endl;
        ss << "XP: " << player.xp << "/" << player.xpToLevel << endl;
        ss << "Credits: " << player.credits << " ¢" << endl;
        ss << "Reputation: " << player.reputation << endl;
        ss << "Heat: " << player.heat << "/100";
        if (player.heat >= 80) ss << " ⚠️ WARNING!";
        ss << endl;
        
        ss << "\n=== SKILLS ===" << endl;
        for (const auto& skill : player.skills) {
            ss << skill.first << ": Level " << skill.second << endl;
        }
        
        ss << "\n=== EQUIPMENT ===" << endl;
        if (player.equipment.empty()) {
            ss << "None" << endl;
        } else {
            for (const auto& item : player.equipment) {
                ss << "- " << item << endl;
            }
        }
        
        ss << "\n=== INVENTORY ===" << endl;
        if (player.inventory.empty()) {
            ss << "Empty" << endl;
        } else {
            for (size_t i = 0; i < player.inventory.size(); i++) {
                ss << (i+1) << ". " << player.inventory[i] << endl;
            }
        }
        
        ss << "\n=== PROGRESS ===" << endl;
        ss << "Missions Completed: " << player.completedMissions.size() << endl;
        ss << "Achievements Unlocked: " << player.achievements.size() << "/12" << endl;
        ss << "Story Path: " << player.storyPath << endl;
        ss << "Current Streak: " << player.missionStreak << endl;
        
        if (player.gameWon) {
            ss << "\n🎉 YOU WON! You are a HACKER TYCOON! 🎉" << endl;
        }
        
        if (player.gameLost) {
            ss << "\n💀 GAME OVER - You were caught by authorities! 💀" << endl;
        }
        
        return ss.str();
    }
    
    // Save player
    bool savePlayer(string username) {
        if (players.find(username) == players.end()) {
            return false;
        }
        
        Player& player = players[username];
        ofstream file(username + "_save.dat");
        
        if (!file.is_open()) {
            return false;
        }
        
        player.lastPlayed = time(0);
        
        file << player.username << endl;
        file << player.characterType << endl;
        file << player.level << endl;
        file << player.xp << endl;
        file << player.xpToLevel << endl;
        file << player.credits << endl;
        file << player.reputation << endl;
        file << player.heat << endl;
        file << player.maxHeat << endl;
        file << player.xpMultiplier << endl;
        file << player.storyProgress << endl;
        file << player.storyPath << endl;
        file << player.seenBackstory << endl;
        file << player.totalEarned << endl;
        file << player.lowHeatMissions << endl;
        file << player.missionStreak << endl;
        file << player.doubleRewardNext << endl;
        file << player.gameWon << endl;
        file << player.gameLost << endl;
        
        // Skills
        for (const auto& skill : player.skills) {
            file << skill.first << " " << skill.second << endl;
        }
        file << "END_SKILLS" << endl;
        
        // Equipment
        for (const auto& item : player.equipment) {
            file << item << endl;
        }
        file << "END_EQUIPMENT" << endl;
        
        // Inventory
        for (const auto& item : player.inventory) {
            file << item << endl;
        }
        file << "END_INVENTORY" << endl;
        
        // Completed missions
        for (int id : player.completedMissions) {
            file << id << " ";
        }
        file << endl << "END_MISSIONS" << endl;
        
        // Achievements
        for (const auto& ach : player.achievements) {
            file << ach << endl;
        }
        file << "END_ACHIEVEMENTS" << endl;
        
        file.close();
        cout << "✓ Saved: " << username << endl;
        return true;
    }
    
    // Load player
    bool loadPlayer(string username) {
        ifstream file(username + "_save.dat");
        
        if (!file.is_open()) {
            return false;
        }
        
        Player player;
        
        file >> player.username;
        file >> player.characterType;
        file >> player.level;
        file >> player.xp;
        file >> player.xpToLevel;
        file >> player.credits;
        file >> player.reputation;
        file >> player.heat;
        file >> player.maxHeat;
        file >> player.xpMultiplier;
        file >> player.storyProgress;
        file >> player.storyPath;
        file >> player.seenBackstory;
        file >> player.totalEarned;
        file >> player.lowHeatMissions;
        file >> player.missionStreak;
        file >> player.doubleRewardNext;
        file >> player.gameWon;
        file >> player.gameLost;
        
        // Skills
        string line;
        getline(file, line); // consume newline
        while (getline(file, line) && line != "END_SKILLS") {
            istringstream iss(line);
            string skillName;
            int skillLevel;
            iss >> skillName >> skillLevel;
            player.skills[skillName] = skillLevel;
        }
        
        // Equipment
        while (getline(file, line) && line != "END_EQUIPMENT") {
            if (!line.empty()) {
                player.equipment.push_back(line);
            }
        }
        
        // Inventory
        while (getline(file, line) && line != "END_INVENTORY") {
            if (!line.empty()) {
                player.inventory.push_back(line);
            }
        }
        
        // Completed missions
        getline(file, line);
        istringstream iss(line);
        int missionId;
        while (iss >> missionId) {
            player.completedMissions.push_back(missionId);
        }
        getline(file, line); // END_MISSIONS
        
        // Achievements
        while (getline(file, line) && line != "END_ACHIEVEMENTS") {
            if (!line.empty()) {
                player.achievements.push_back(line);
            }
        }
        
        file.close();
        
        players[username] = player;
        cout << "✓ Loaded: " << username << endl;
        return true;
    }
    
    // List all missions
    void listMissions(string username = "") {
        Player* player = nullptr;
        if (!username.empty() && players.find(username) != players.end()) {
            player = &players[username];
        }
        
        vector<Mission> available = player ? getAvailableMissions(*player) : missions;
        
        cout << "\n=== AVAILABLE MISSIONS ===" << endl;
        for (const auto& mission : available) {
            cout << "[" << mission.id << "] " << mission.name;
            cout << " | Level " << mission.reqLevel << " | ";
            cout << mission.type << " | Heat +" << mission.heat;
            cout << " | " << mission.xpReward << " XP | " << mission.creditsReward << " ¢";
            
            if (player) {
                bool completed = false;
                for (int id : player->completedMissions) {
                    if (id == mission.id) {
                        completed = true;
                        break;
                    }
                }
                if (completed) cout << " ✓ DONE";
                else if (player->level < mission.reqLevel) cout << " 🔒 LOCKED";
            }
            
            cout << endl;
        }
    }
};

// ============================================================================
// MAIN FUNCTION
// ============================================================================

int main() {
    GameServer server;
    
    cout << "╔════════════════════════════════════════╗" << endl;
    cout << "║  🎮 HACKER TYCOON - C++ EDITION 🎮    ║" << endl;
    cout << "╠════════════════════════════════════════╣" << endl;
    cout << "║  Complete Edition with All Features    ║" << endl;
    cout << "║  🔥 Heat System                        ║" << endl;
    cout << "║  🎲 Random Events                      ║" << endl;
    cout << "║  🏆 Achievements                       ║" << endl;
    cout << "║  ⚖️  Legal/Illegal Missions            ║" << endl;
    cout << "╚════════════════════════════════════════╝" << endl;
    
    cout << "\nCommands:" << endl;
    cout << "  create <username> <character>  - Create player (ghost/cipher/rebel/architect)" << endl;
    cout << "  mission <username> <id> <rate> - Start mission (rate = success % 1-100)" << endl;
    cout << "  heat <username>                - Reduce heat (costs 300 ¢)" << endl;
    cout << "  buy <username> <item_id>       - Buy item (vpn/laptop/exploit/server/ai/quantum)" << endl;
    cout << "  upgrade <username> <skill>     - Upgrade skill (hacking/cryptography/networking/programming)" << endl;
    cout << "  story <username> <path>        - Choose path (stealth/aggressive/neutral)" << endl;
    cout << "  stats <username>               - View player stats" << endl;
    cout << "  missions [username]            - List all missions" << endl;
    cout << "  save <username>                - Save player" << endl;
    cout << "  load <username>                - Load player" << endl;
    cout << "  quit                           - Exit game" << endl;
    
    string command;
    while (true) {
        cout << "\n> ";
        cin >> command;
        
        if (command == "create") {
            string username, character;
            cin >> username >> character;
            cout << server.createPlayer(username, character) << endl;
        }
        else if (command == "mission") {
            string username;
            int missionId, successRate;
            cin >> username >> missionId >> successRate;
            cout << server.startMission(username, missionId, successRate) << endl;
        }
        else if (command == "heat") {
            string username;
            cin >> username;
            cout << server.reduceHeat(username) << endl;
        }
        else if (command == "buy") {
            string username, itemId;
            cin >> username >> itemId;
            cout << server.buyItem(username, itemId) << endl;
        }
        else if (command == "upgrade") {
            string username, skill;
            cin >> username >> skill;
            cout << server.upgradeSkill(username, skill) << endl;
        }
        else if (command == "story") {
            string username, path;
            cin >> username >> path;
            cout << server.storyChoice(username, path) << endl;
        }
        else if (command == "stats") {
            string username;
            cin >> username;
            cout << server.getPlayerStats(username) << endl;
        }
        else if (command == "missions") {
            string username;
            cin >> username;
            if (username == "all" || cin.eof()) {
                server.listMissions();
            } else {
                server.listMissions(username);
            }
            cin.clear();
        }
        else if (command == "save") {
            string username;
            cin >> username;
            if (server.savePlayer(username)) {
                cout << "SUCCESS: Game saved!" << endl;
            } else {
                cout << "ERROR: Failed to save" << endl;
            }
        }
        else if (command == "load") {
            string username;
            cin >> username;
            if (server.loadPlayer(username)) {
                cout << "SUCCESS: Game loaded!" << endl;
            } else {
                cout << "ERROR: Save file not found" << endl;
            }
        }
        else if (command == "quit" || command == "exit") {
            cout << "Thanks for playing Hacker Tycoon!" << endl;
            break;
        }
        else {
            cout << "Unknown command. Type 'help' for commands." << endl;
        }
    }
    
    return 0;
}