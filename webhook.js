const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const APIAI_TOKEN = "411f0f79f5584f85b62c193ebc4275ce";
const API_KEY = "AIzaSyAo4DkMcfZ6eFnN0nY3_PiPtNF8ch5ffW4";


const apiai= require("apiai");
const apiaiApp= apiai(APIAI_TOKEN);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});




function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'tabby_cat'
  });

  apiai.on('response', (response) => {
    console.log(response)
    let aiText = response.result.fulfillment.speech;

    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: "EAAFumyClZAYoBANRAE3ayTQxwI2fTtGvuVrCmWMatwLAZAKJdlqXbZCV1Nozfrzt6SkIRaUFZAaJ6cw54kTYfPGizXlRRhqk5Gfz0QPjlfij5JsQuu2DezsvzePsftZCd5IHJOaRdz7Ek4KQhTmrBRsZCixtNHxF7JwzTlyktXZCw0kDTNrAJXD"},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: aiText}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
  });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}
app.post('/ai', (req, res) => {
  console.log('*** Webhook for api.ai query ***');
  

  if (req.body.result.action === 'booking') {
    console.log('*** weather ***');
    let city = req.body.result.parameters['to'].value;
    let restUrl = ''; 

let to = req.body.result.parameters['to'];
let from =req.body.result.parameters['from']
let date =req.body.result.parameters['date']
    var request = require("request")
 
    // JSON to be passed to the QPX Express API
    var requestData = {
        "request": {
            "slice": [
                {
                    "origin":to,
                    "destination": from,
                    "date": date
                }
            ],
            "passengers": {
                "adultCount": 1,
                "infantInLapCount": 0,
                "infantInSeatCount": 0,
                "childCount": 0,
                "seniorCount": 0
            },
            "solutions": 2,
            "refundable": false
        }
    }
 
    // QPX REST API URL (I censored my api key)
    url = "https://www.googleapis.com/qpxExpress/v1/trips/search?key=AIzaSyAo4DkMcfZ6eFnN0nY3_PiPtNF8ch5ffW4 "
 
    // fire request
    request({
    url: url,
    method: "POST",
    headers: {
        "content-type": "application/json",
        },
    body: JSON.stringify(requestData)
//  body: JSON.stringify(requestData)
    }, function (error, response, body) {
       var data = JSON.parse(response.body);
     let msg =('I have found a flight to'+ (JSON.stringify(data.trips.data.airport[0].code) )+  'to' + (JSON.stringify(data.trips.data.airport[2].code) ) +  ' on '+date+' via'  + (JSON.stringify(data.trips.data.airport[1].code) )+ 'and the ticket amounts' +JSON.stringify(data.trips.tripOption[0].saleTotal)+  ' .Shall I go ahead and book this ticket?!'); 
 // console.log(JSON.stringify(data.trips.tripOption[0].saleTotal));
  //console.log(JSON.stringify(data.trips.tripOption[1].saleTotal));
  // 'The current condition in '+req.body.result.parameters['to']+' thank you!';

  //let msg= 'hi'+to +' and'+ from +' ok';
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'booking'
        });
    });
        /*let msg = 'The current condition in '+req.body.result.parameters['to']+' thank you!';
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'booking'
        });
 

   /* request.get(restUrl, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(body);
        console.log(json);
        
        let msg = 'The current condition in ';
        return res.json({
          "speech": msg,
          "displayText": msg,
          "source": 'booking'
        });
      } else {
        let errorMessage = 'I failed to look up the city name.';
        return res.status(400).json({
          status: {
            code: 400,
            errorType: errorMessage
          }
        });
      }
    })*/
  }

});