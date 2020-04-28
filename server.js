var express = require('express');
var app = express();

app.use(express.static('client'));

app.listen(3000, function(){
    console.log("WEBGL ROOM SERVER RUNNNG... \nAccessible at: http://localhost:3000/room.html");
});