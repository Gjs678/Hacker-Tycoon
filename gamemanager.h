#ifndef GAMEMANAGER_H
#define GAMEMANAGER_H
#include "Player.h"
#include "Shop.h"
#include "Leaderboard.h"
class GameManager{
public:
Player player;
Shop shop;
Leaderboard board;
void newGame(string,string);
void mission();
void buyItem(int);
string stats();
};
#endif