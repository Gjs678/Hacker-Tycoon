#ifndef PLAYER_H
#define PLAYER_H
#include <string>
using namespace std;
class Player {
public:
string name, character;
int level, xp, energy, money, heat;
Player();
void gainXP(int);
void increaseHeat(int);
void reduceHeat(int);
};
#endif