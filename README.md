# ARTris game server

Game engine server for ARTris ios app. Special thanks to [fridek](https://github.com/fridek) the core or our game engine is based on on his [tetris project](https://github.com/dtoki/Threejs-Tetris) 

## Development

### Dependencies
Here are the list of dependencies 
- [Node.js](https://nodejs.org/en/)
- [Firebase-tools](https://www.npmjs.com/package/firebase-tools)

### Running the game engine

#### Setup
1. Clone the repository

2. Set up your firebase real-time database

    - Create a new firebase project or reuse an old one
    - For development set your firebase realtime database rules to true for both read and write
    - Download service key and save it in cred/ folder, name the file `serviceAccountKey.json`. to download the file go to : Project Settings -> Service Accounts -> Generate New Private Key

3. Configure index.js
    - go to line 8 on index.js and replace the `fireDatabaseUrl` with the database url of your firebae project

#### Run
  execute the command 
  ```bash
  node index.js
  ```