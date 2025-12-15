#include "leaderboard.h"
#include <fstream>
#include <sstream>
using namespace std;
void Leaderboard::update(Player& p){ ofstream f("leaderboard.txt",ios::app); f<<p.name<<" "<<p.level<<"\n"; f.close(); }
string Leaderboard::fetch(){ ifstream f("leaderboard.txt"); string n; int l; stringstream ss; while(f>>n>>l) ss<<n<<" (Lvl "<<l<<")\n"; return ss.str(); }