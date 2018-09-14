var accountSid = 'AC78277f01424a4fc8efa95053c36b9171'; // Your Account SID from www.twilio.com/console
var authToken = 'cbf65259d8db58bb2dbb6fe1eb5cc4cd';   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

client.messages.create({
    body: 'Hello from Node',
    to: '+447736978829',  // Text this number
    from: '+441392690306' // From a valid Twilio number
})
.then((message) => console.log(message.sid));