var mqtt = require('mqtt')

var options = {
    host: 'f6407c46de6948ba9b876ffa65557b6e.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'huybui',
    password: 'buihuy273',
}

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
});

client.subscribe('scs/home1/data');

client.publish('scs/home1', 'ctrl 1 0');