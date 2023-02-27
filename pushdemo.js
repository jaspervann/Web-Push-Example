/*

Server backend example for the Web Push Example repo on http://github.com/thedamian/web-push-example

This server has three purposes

1) Serve the html page that will have all the Javascript to setup the notification on the browser
2) Receive the token from each client and store it (right now in just a basic array)
3) Sending a notification to ALL clients that registered through their respective Urls
*/


// Setup the basics for a basic express server
const express = require("express")
const cors = require("cors")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5004
app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set("views", __dirname + `/views`);
app.use(express.static(__dirname + "/public"));

// Push notification setting up
const webpush = require('web-push');
// VAPID keys should only be generated only once. we've run "node vapid.js" to do this.
const vapidPublicKey = process.env.WEBPUSHPUBLICKEY;
const vapidPrivateKey = process.env.WEBPUSHPRIVATEKEY;




webpush.setVapidDetails(
  'mailto:damian@floridajs.com',
  vapidPublicKey,
  vapidPrivateKey
);
// Push notification setting up
// Push notification setting up

app.get("/",(req,res) => {
   res.render("index.ejs",{vapidPublicKey:vapidPublicKey});
});

var tokenlist = [];

app.post('/newbrowser',function(req,res){
    var token = req.body.token;
    var isSafari = (req.headers['user-agent'].indexOf("Safari") > 0);
    var auth = req.body.auth;
    var endpoint = req.body.endpoint;
    tokenlist.push({token:token,auth:auth,isSafari:isSafari,endpoint:endpoint});
    console.log("adding token: "+ token + " with auth: " + auth + " and notification url:" + endpoint);
    res.end("ok");
});


app.get('/notify',function(req,res) { 
// Let ALL browsers pop up a message
  // console.log(" We've been notified. Now send notification to all browsers");
   
   var options = {
       TTL: 24 * 60 * 60,
       vapidDetails: {
         subject: 'mailto:damian@floridajs.com',
         publicKey: vapidPublicKey,
         privateKey: vapidPrivateKey
       }
   };
   var message = "Web Notification from FloridaJS! Yeaheee!!!!";
       
   // Hit each browser that registered with us.
   for (var i=0;i < tokenlist.length;i++) {
       // Code here.
       let pushSubscription = {
        "endpoint":tokenlist[i].endpoint,
        "keys": {
            "p256dh":tokenlist[i].token,
            "auth": tokenlist[i].auth
            } // end keys
       }; // end pushSubscription 
       
       // MAGIC!
       webpush.sendNotification(pushSubscription,message,options);
   }
   
   console.log(tokenlist.length + " notification sent");
   
   res.end( tokenlist.length + " notification sent");
   
});


app.listen(port,function() { console.log("started on port " + port); });
