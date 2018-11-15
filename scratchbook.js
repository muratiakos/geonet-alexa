const http = require('http');
var content = 'unpopulated'

http.get('http://api.geonet.org.nz/quake?MMI=3', (res) => {
    res.on("data", function(chunk) {
        console.log("BODY: " + chunk);
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});

return;

http.get('http://api.geonet.org.nz/quake?MMI=3', (res) => {
    //console.log('statusCode:', res.statusCode);
    //console.log('headers:', res.headers);

    //Fetching data
    res.on('data', (d) => { responseString += d; });

    //Finished
    res.on('end', function(res) {
        //console.log('Response------------>', responseString);
        const eqobj=JSON.parse(responseString);
        speechOutput = eqobj["features"][0]["properties"]["locality"];
        //console.log('==> API response: ', speechOutput);
        //console.log('What comes after this?')

        console.log(`After constructing the speechOutput=${speechOutput}`);
    });
}).on('error', (e) => { console.error(e);});