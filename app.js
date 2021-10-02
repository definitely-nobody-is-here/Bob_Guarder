// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

const express = require('express');
const app = express();
const server = require('http').Server(app);

app.get('/', function(req, res) {res.sendFile(__dirname + '/client/index.html');});
app.use('/client',express.static(__dirname + '/client'));

if (process.env.PORT) {
    server.listen(process.env.PORT);
} else {
    server.listen(5000);
}