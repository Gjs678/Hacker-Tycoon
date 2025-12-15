#ifndef LEADERBOARD_H
#define LEADERBOARD_H
#include "Player.h"
class Leaderboard{
public:
void update(Player&);
string fetch();
};
#endif