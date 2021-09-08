Bubastis.js README
========================

A simple Node script that utilizes the Slack API and the Philips Hue API to monitor for keywords in a Slack channel and trigger light changes corresponding to the trigger. You will need to have:

- A Philips Hue bridge that you have on your local network (and that you know the IP address of)
- A Philips Hue light that you wish to control
- The ability to access the Slack API / generate an "app" within Slack


# Required Packages #

Bot uses the the following packages:

- `dotenv` package to read the `.env` file (https://github.com/motdotla/dotenv)
- `botkit` for the bot framework (learn more here: )https://botkit.ai)
- `unirest` for sending the `put` requests to the Hue bridge (http://kong.github.io/unirest-java/#requests)

_OPTIONAL: The_ `forever` _package to ensure that the Node script runs in the background continuously. My use / this documentation references it. More information found here: https://github.com/foreversd/forever_

Install the required packages with:

```
npm i dotenv botkit unirest forever
```


# Hue Bridge User Generation #
Follow the steps here to acquire your Hue bridge user token: 

https://developers.meethue.com/develop/get-started-2/


# Slack Bot / App Generation #

Follow these steps to create the Slack bot and generate an API OAuth token:

1. Go to: https://api.slack.com/apps?new_app=1 (and create a bot ("app") with the desired name / workspace)
2. Under "_Features_" go to "_Incoming Webhooks_", activate the switch to "_On_"
3. Click "_Add New Webhook to Workspace_" button at the bottom
4. Search for and select the channel to add the bot, click "_Allow_"
5. Under "_Features_" go to "_OAuth & Permissions_", copy the "_Bot User OAuth Token_" (starts with `xoxb`)


# Configuration #

The following details how to get the bot configured to work / respond to the triggers you designate.

## Environment Variables ##

Move `example.env` to `.env` and replace the corresponding dummy entries for:

- `SLACK_API_TOKEN` (Slack API / OAuth token)
- `HUE_USER_TOKEN` (Hue user token from Hue bridge)
- `HUE_BRIDGE_IP` (Hue bridge IP address)


## Triggers ##

There are two types of triggers that I am using / will discuss: keyword triggers and user specific triggers.

### Keyword Triggers ###

The bot has various `controller.hears` sections that "listen" for certain keywords (configured via regex) to appear in channel or for specific users to post in channel. When that happens it sends a `put` request to the Hue controller with specific lighting actions. The end of each section calls a function to turn the light off. 

An example "listen" component would be:

```
controller.hears(['Host.*Impact.*'], ['ambient'], function(bot, message) {
  // Sets light to Yellow for Corero alert
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/1/state').send('{"on":true, "hue":11000, "transitiontime":0, "bri":254}').end();
  setTimeout(backToOff, 3000);
});
```

The above utilizes regex to look for the a line starting with `Host` and having any number of characters between it and the word `Impact`, specifically this portion of the above:

```
controller.hears(['Host.*Impact.*'],
```

If a line matching that regex pattern is found posted to channel the bot sends the following lighting actions to the Hue brudge controller:

```
unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/1/state').send('{"on":true, "hue":11000, "transitiontime":0, "bri":254}').end();
```

### User Specific Triggers ###

To have the bot respond anytime a particular individual posts a message (useful for responding to messages from bots themselves) you need to use the user ID rather than a regex pattern. To find the user ID:

Right click on the name of the user (or bot) in a channel (any of their messages will do), select _copy link_, then paste the link into a text editor. The result will look like this:

```
https://lw.slack.com/team/U0C9NTT8A
.........................|---------| <-- USER ID
```

The end component is the user ID. Use that in your `controller.hears` configuration section. An example would be:

```
// Bot component that looks for someone using my name in channel
controller.hears(['mmcdonald', '<@U0A0AAA0A>'], ['ambient'], function(bot, message) {
  // Sets light to Green with a soft blink
  unirest.put('http://' + hueBridge + '/api/' + hueUser + '/lights/16/state').send('{"on":true, "hue":19000, "transitiontime":1, "bri":200, "alert":"select"}').end();
  setTimeout(backToOff, 1750);
});
```


## Hue Color / Lighting Handling Summary ##

Full documentation can be found here: 

https://developers.meethue.com/develop/get-started-2/core-concepts/#color_gets_more_complicated

The parts of the `put` command can be broken down as such:

**/lights/16/state**: this is detailing which specific light you want to trigger. I'm focusing on a specific light / bulb (in this case light / bulb `16`); however you can change `/lights/` to `/groups/` if you would prefer to affect a pre-configured group of lights. The link posted above (https://developers.meethue.com/develop/get-started-2/) also discusses how to identify the particular lights / groups.

**On**: the accepted values are a case-sensitive “True” or “False”.

```
"on":true, # Sets a light on
"on":false, # Sets a light off
```

**Hue**: a value from ``0`to `65,535` going around the color wheel through red, yellow, blue, and back to red.

![Hue Color Wheel](/assets/hue_color_wheel.png "Hue Color Wheel")

```
"hue":0, # Sets light 1 to red
"hue":65535, # Sets light 1 also to red
"hue":49151, # Sets light 1 also to blue
"hue":16384, # Sets light 1 also to lime
```

**Brightness**: a value from `0` to `254`. `0` is not off, it’s just the dimmest setting a light can have while still being on, and it’s not really that dim. If a light is off, no matter the brightness, the light will still appear off.

```
"bri":0, # Sets light 1 to dim
"bri":254, # Sets light 1 to full brightness
```

**Transition Time**: a number of 1/10ths of a second the bulb will spend transitioning from the previous state to the next state. The default is `0.4` seconds and transitions will always happen at that speed unless otherwise defined.

```
"bri":254, "transitiontime":5 # Sets light 1 to full brightness over half a second.
"hue":49151, "bri":0, "transitiontime":0 # Sets light 1 to blue with no delay
```

There is no built-in component for causing lights to blink. A way to simulate this is having multiple actions send in succession with `off` commands in between, like so:

```
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
```


# Running the Script #

As a simple Node script you can run it from the terminal with:

```
node bubastis.js
```

However this will run the script in the foreground and provide no type of health check to keep the script running. I utilize `forever` to start the script in the background / daemonized and ensure that it continues to run / restarts in the event of an issue. To start the script with `forever` so that it can read the `.env` file requires a bit more complicated command than `forever` normally needs since you have to pass along for it to read the `dotenv` config and identify the working directory for the `.env` file:

```
forever -c "node -r dotenv/config" --workingDir $APP_WORKING_DIR start bubastis.js
```

Replace `$APP_WORKING_DIR` with the path to the working directory where you cloned this repository.


# Known Issues #

Occasionally the Hue light will get stuck on. To fix this simply trigger an action again and it will flush out the stuck signal and correct itself.
