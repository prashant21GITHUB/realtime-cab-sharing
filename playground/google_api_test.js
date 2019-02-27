const googleMapsApi = require("@google/maps");

const googleMapsClient = googleMapsApi.createClient({
    key: 'AIzaSyDGvspAuYLNKpawQ-OYCwsrIOW8Qo5GPRs'
  });

// Geocode an address.
googleMapsClient.geocode({
    address: 'awas vikas colony sitapur'
  }, function(err, response) {
    //   console.log(response.json.results);
    if (!err) {
      console.log(response.json.results);
    }
  });

  