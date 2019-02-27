const mysql = require("mysql");
const _ = require("lodash");

// var conn = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "root",
//     database: "realtime_cab_sharing"
// });

var pool  = mysql.createPool({
    connectionLimit : 10,
    host: "localhost",
    user: "root",
    password: "root",
    database: "realtime_cab_sharing"
  });

function createDBConnection() {
    return conn.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        
      });
}


function registerNewUser(name, mobile_num, lat, lng){

    if(mobile_num.length != 10) {
        console.log("Invalid mobile number: " + mobile_num);
        return;
    }
    // query = "Select * from `User`";
    query = "INSERT into `User`(`name`, `mobile`, `current_lat`, `current_lng`) VALUES (?,?,?,?)";
    pool.query(query, [name, mobile_num, lat, lng], (err, results, fields) => {
        if(err){
            console.log("db error while registering new user: " + err)
        } else {
            if(results.changedRows > 0) {
                console.log("New user created succesfully");
            } else {
                console.log("User already exists with this mobile number: "+ mobile_num)
            }
        }
        
    })
}

function updateCurrentLocation(mobile_num, lat, lng) {
   
    if(mobile_num.length != 10) {
        console.log("Invalid mobile number: " + mobile_num);
        return;
    }
    // query = "Select * from `User`";
    query = "update `User` SET  `current_lat` = ?, `current_lng` = ? " +
    "WHERE mobile = ?";
    pool.query(query, [lat, lng, mobile_num], (err, results, fields) => {
        if(err){
            console.log("db error while updating current location: " + err)
        } else {
            console.log("Updated rows: " + results.changedRows);
        }
       
    })
}

function getAllUsers(){
    query = "SELECT * from User";
    const dbPromise = new Promise((resolve, reject) => {
        pool.query(query, (err, results, fields) => {
            if(err){
                console.log("db error while getting the  list of registered users: " + err)
                reject({
                    errorMessage:"db error while getting the  list of registered users: " + err
                });
            } else {
                // console.log("Users" + JSON.stringify(results));
                results.forEach(element => {
                    // console.log(element)
                });
                resolve(JSON.stringify(results));
            }
           
        })
    });
    return dbPromise;
    
}

function rad2deg(radians){
    var pi = Math.PI;
  return radians * (180/pi);
}

function deg2rad(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}

function calculateDistanceBetweenTwoLocations($lat1, $lng1, $lat2, $lng2) {
    // convert latitude/longitude degrees for both coordinates
    // to radians: radian = degree * π / 180
    $lat1 = deg2rad($lat1);
    $lng1 = deg2rad($lng1);
    $lat2 = deg2rad($lat2);
    $lng2 = deg2rad($lng2);

    // calculate great-circle distance
    $distance = Math.acos(Math.sin($lat1) * Math.sin($lat2) + Math.cos($lat1) * Math.cos($lat2) * Math.cos($lng1 - $lng2));

    // distance in human-readable format:
    // earth's radius in km = ~6371
    return 6371 * $distance;
}



/**
 * 
 * @param {current latitude} lat 
 * @param {current longitude} lng 
 * @param {in kMs} radius 
 */
function getNearbyCabsLocation(lat, lng, targetDistance) {
    const dbPromise = new Promise((dbResolve, dbReject) => {
        // we'll want everything within, say, 10km distance

        // earth's radius in km = ~6371
        radius = 6371;

        // latitude boundaries
        maxlat = lat + rad2deg(targetDistance / radius);
        minlat = lat - rad2deg(targetDistance / radius);

        // longitude boundaries (longitude gets smaller when latitude increases)
        maxlng = lng + rad2deg(targetDistance / radius / Math.cos(deg2rad(lat)));
        minlng = lng - rad2deg(targetDistance / radius / Math.cos(deg2rad(lat)));
        console.log("Latitude: Min:" + minlat+",Max:"+maxlat);
        console.log("Longitude: Min:" + minlng+",Max:"+maxlng);

        query = "select * from User WHERE (`current_lat` BETWEEN  ? AND ?) AND (`current_lng` BETWEEN  ? AND ?)";
        let queryPromise = new Promise((queryResolve, queryReject) => {
            pool.query(query, [minlat, maxlat, minlng, maxlng], function(err, results, fields) {
                if(!err){
                    if(results.length == 0) {
                        console.log("No nearby cabs found")
                    } else {
                        results.forEach(res => {
                            // console.log(res);
                        })
                    }
                    queryResolve(results);
                } else {
                    console.log("DB error while fetching near by cab locations: " + err);
                    queryReject({
                        errorMessage: err
                    });
                }
            });
        });

        queryPromise.then((queryResults) => {
            let filteredLocations = _.remove(queryResults, (res)=> {
        
                let distanceBetweenTwoLocations = calculateDistanceBetweenTwoLocations(lat, lng, res.current_lat, res.current_lng);
                console.log("distace from: ", res.current_lat, res.current_lng, distanceBetweenTwoLocations);
                return distanceBetweenTwoLocations < targetDistance;
            })
            
            dbResolve(JSON.stringify(filteredLocations));
        }, (error) => {
            dbReject({
                errorMessage: error
            })
        });
        
    });
    return dbPromise;
    
}


// getAllUsers();
// let results = getNearbyCabsLocation(28.568121, 77.315611, 2);
// results.then((results) => {
//     console.log(results);
// });

module.exports.updateCurrentLocation = updateCurrentLocation;
module.exports.getRegisteredUsers = getAllUsers;
module.exports.getNearbyCabsLocation = getNearbyCabsLocation
  