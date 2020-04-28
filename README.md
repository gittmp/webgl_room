# My WebGL Living Room

### Initiating System

1. When the system is first opened on a computer, a few initiating steps need to be taken.

2. Navigate to the base directory (the initial one containing the *client* sub-directory, *server.js* file and this *README.md* file) through the command line.

3. Run the following command on the command line:
- *npm install*
- N.B. This requires that you have NPM and Node installed on your computer, instructions on how to install this if you have not already can be found at: https://www.taniarascia.com/how-to-install-and-use-node-js-and-npm-mac-and-windows/

4. This should automatically install all needed dependencies for the server which my WebGL system is running on.

### Running System

1. Once the system has been initiated, the server on which everything runs bneeds to be started.

2. To do this (from within the same directory as before), enter the following command on the command line:
- *npm start*

3. You should be shown the message 'WEBGL ROOM SERVER RUNNING...', meaning the system is now ready for you to access my WebGL room.

### Viewing On Browser

1. To view my WebGL room,load up the browser of your choice.

2. Input EITHER of the following into the address bar and hit enter:
- *http://localhost:3000/room.html*
- OR
- *http://127.0.0.1:3000/room.html*

3. This should then take you to a tab titled 'My Living Room' showcasing my WebGL room and instructions of how to interact with it.

### File System

1. The file system of my WebGL project is laid out as follows.

2. Base directory contains:
- *client* directory containing all WebGL files.
- *node_modules* directory and *package.json*/*package-lock.json* files for the initiation/running of the server.
- *server.js* file containing server code.
- *README.md* (this) instruction file

2. *client* directory contains:
- *content* directory containing all texture files.
- *lib.js* file which defined all necessary WebGL functions.
- *vecmat.js* file which dwfines all vector/matrix structures and manipulations on them.
- *room.html* file containing code for the HTML webpage on which the WebGL content is applied.
- *room.js* file containing all WebGL code for my living room.
