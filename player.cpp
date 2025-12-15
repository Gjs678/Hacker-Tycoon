#include "Player.h"
Player::Player(){ level=1; xp=0; energy=100; money=500; heat=0; }
void Player::gainXP(int a){ xp+=a; if(xp>=100){ level++; xp=0; } }
void Player::increaseHeat(int a){ heat+=a; }
void Player::reduceHeat(int a){ heat-=a; if(heat<0) heat=0; }