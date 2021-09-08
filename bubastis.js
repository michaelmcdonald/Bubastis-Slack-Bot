require('dotenv').config();

console.log(process.env);

var Botkit = require('botkit');
var unirest = require('unirest');

var botToken = process.env.SLACK_API_TOKEN;
var hueBridge = process.env.HUE_BRIDGE_IP;
//var hueBridge = '10.30.6.165';
var hueUser = process.env.HUE_USER_TOKEN;

var controller = Botkit.slackbot({
  debug: false
});

controller.spawn({
  token: botToken
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});


// Bot component that looks for text from our Corero alerts
controller.hears(['.*Search DIP Unblocked Sflow.*'], ['bot_message'], function(bot, message) {
  // Sets light to Yellow and blinks rapidly four times
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":false}').end();
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":11000, "transitiontime":0, "bri":200}').end();
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":false}').end();
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":11000, "transitiontime":0, "bri":200}').end();
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":false}').end();
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":11000, "transitiontime":0, "bri":200}').end();
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":false}').end();
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":11000, "transitiontime":0, "bri":200}').end();
  setTimeout(backToOff, 1000);
});

// Bot component that looks for someone using my name in channel
controller.hears(['mmcdonald', '<@U0C9NTT8A>'], ['ambient'], function(bot, message) {
  // Sets light to Green with a soft blink
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":19000, "transitiontime":1, "bri":200, "alert":"select"}').end();
  setTimeout(backToOff, 1750);
});

// Bot component that looks for someone requesting network team assistance
controller.hears(['mmcdonald', '<@U0C9NTT8A>'], ['bot_message'], function(bot, message) {
  // Sets light to Green with a soft blink
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":19000, "transitiontime":1, "bri":200, "alert":"select"}').end();
  setTimeout(backToOff, 1750);
});

// Bot component that looks for text from our bot monitoring peer status
controller.hears(['.*neighbor (.*) *Down*.*'], ['bot_message'], function(bot, message) {
  // Sets light to Red
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":0, "transitiontime":0, "bri":254}').end();
  setTimeout(backToOff, 3000);
});

// Bot component that looks for text from our logging of interface status
controller.hears(['.*border.* (.*) Interface (.*) Down.*'], ['bot_message'], function(bot, message) {
  // Sets light to Red
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":0, "transitiontime":0, "bri":254}').end();
  setTimeout(backToOff, 3000);
});

// Bot component that looks for text from ticket / case handoffs
controller.hears(['.*Note Case Handoff. Group: Network Case.*'], ['bot_message'], function(bot, message) {
  // Sets light to purple with three soft blinks
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":52000, "transitiontime":5, "bri":200, "alert":"lselect"}').end();
  setTimeout(backToOff, 3000);
});

// Bot component that looks for text from ticket / case handoffs
controller.hears(['.*A new case has been assigned to the Network Case team.*'], ['bot_message'], function(bot, message) {
  // Sets light to purple with three soft blinks
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":52000, "transitiontime":5, "bri":200, "alert":"lselect"}').end();
  setTimeout(backToOff, 3000);
});

function backToOff(){
  // Sets light to "off" state
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":false, "transitiontime":0}').end();
}

