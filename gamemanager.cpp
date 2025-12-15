#include "GameManager.h"
#include <sstream>
using namespace std;
void GameManager::newGame(string n,string c){ player=Player(); player.name=n; player.character=c; }
void GameManager::mission(){ if(player.energy<=0) return; player.energy-=15; player.money+=200; player.gainXP(40); player.increaseHeat(20); if(player.heat>=100){ player.heat=0; player.money-=200; } }
void GameManager::buyItem(int id){ if(id==1) shop.buyEnergy(player); else if(id==2) shop.buyHeatReducer(player); }
string GameManager::stats(){ stringstream ss; ss<<"{\"name\":\""<<player.name<<"\",\"level\":"<<player.level<<",\"xp\":"<<player.xp<<",\"energy\":"<<player.energy<<",\"money\":"<<player.money<<",\"heat\":"<<player.heat<<"}"; return ss.str();
 }