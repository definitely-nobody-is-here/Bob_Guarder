// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

const express = require('express');
const app = express();
const server = require('http').Server(app);

app.get('/', function(req, res) {res.sendFile(__dirname + '/client/index.html');});
app.use('/client',express.static(__dirname + '/client'));

setInterval(function() {
    var thing = 'hi';
}, 1000);