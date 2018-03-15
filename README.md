# MinesweeperIO
The classic game in the multiplayer version. 
Rules-standard, open field elements, mark mines, use smart opening. 
Each game involves two players, and you are not opponents. Your common goal is to win.
![2018-03-12 03-19-37](https://user-images.githubusercontent.com/9293641/37260578-1df8d4c8-25a6-11e8-9392-49f5a4c5dd8e.png)

## Getting started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Requirements

What things you need to run the game
```
nodejs
npm
```
## Runnining

This application is built on a service architecture, which means that the individual application modules can be written independently and are run separately as well. To run the application, you must run both gateway and individual services. In the process, the application services can be switched off, they can recover or be replaced by other services that can handle similar requests.
Browse to the project folder and start the gateway.
```
cd /path/to/MinesweeperIO
node server.js
```
Run game services from the services directory
```
cd /path/to/MinesweeperIO/services
node gamestart.js
node usermove.js
node checkendgame.js
node endgame.js
```

After that, the game will be available at
```
localhost:5000
```
It is worth noting that the address localhost:5000 is available after the gateway is launched, but without the launch of additional services, many features may not be available.
Now you can run at least two browser windows and play this game.

