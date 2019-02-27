const express = require("express");
const path = require("path");
const db = require("./db");

var app = express();

app.use(express.static(__dirname+"/public"));

// Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+'/home.html'))
});

app.get("/api/getRegisteredUsers", (req, res) => {
    db.getRegisteredUsers().then((results) => {
        res.send(results);
    }, (errorMessage) => {
        res.send(errorMessage);
    });
    // res.send(db.getRegisteredUsers());
});

app.get("/api/getNearbyCabs", (req, res) => {
    if(req.query.latlng == undefined) {
        res.send("Latitude and longitude are not provided in input!!");
        return;
    }
    let distance = req.query.distance;
    if(distance == undefined) {
        distance = 10;
    }
    console.log("input: ", req.query.latlng, distance)
    let latlng = req.query.latlng.split(",")
    console.log("Input: LAT LNG:", latlng[0], latlng[1]);
    db.getNearbyCabsLocation(parseFloat(latlng[0]), parseFloat(latlng[1]), parseFloat(distance)).then((results) => {
        res.send(results);
    }, (errorMessage) => {
        res.send(errorMessage);
    });
    // res.send(db.getRegisteredUsers());
});

app.get("/bad", (req, res) => {
    res.send({
        errorMessage: "Unable to display page"
    });
});

app.listen(3000);

// db.getRegisteredUsers();