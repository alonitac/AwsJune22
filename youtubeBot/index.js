"use strict";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const ytsr = require('ytsr');
const AWS = require('aws-sdk');
var morgan = require('morgan');
require('dotenv').config();

var bodyParser = require('body-parser');

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(morgan('combined'));
app.use('/public', express.static('public'));

app.get('/', (req, res) =>  {
  // console.log(req.headers);
  res.sendFile(__dirname + '/');
});

const sqs = new AWS.SQS({region: process.env.SQS_REGION});
const cw = new AWS.CloudWatch({region: process.env.SQS_REGION});
const autoscaling = new AWS.AutoScaling({region: process.env.SQS_REGION});

app.get('/status', (req, res) => {
	res.sendStatus(200);
});


app.get('/load-test', (req, res) => {
	var x = 6;
	for (var i=1; i <= 10000000; i++) {
		x = x * i;
		x = x / i;
	}
	res.sendStatus(200);
});

app.post('/youtube', (req, res) =>  {
	const msg = req.body.text;
	console.log(`Incoming message: ${msg}`);

	// searching in youtube....
	ytsr(msg, {limit: 1, pages: 1}).then((result) => {
	    const item = result.items[0];
		console.log(item);

		if (result.items.length > 0){
            var params = {
              MessageBody: JSON.stringify(item),
              QueueUrl: process.env.QUEUE_URL
            };

            sqs.sendMessage(params, function(err, data) {
              if (err) {
                console.log("Error", err);
              } else {
                console.log("Success", data.MessageId);
                res.json({
                    'text': item.title,
                    'link': item.url,
                    'videoId': item.id
                });
              }
            });

		} else {
			res.json({'text': `No video found for ${msg}... `});
		}

	}).catch((err) => {
		console.log(err);
		res.json({'text': 'Something went wrong... please try again'});
	});
});

async function calcMsgsInQueue() {
        const params = {
          QueueUrl: process.env.QUEUE_URL,
          AttributeNames: ["ApproximateNumberOfMessages"]
        };
        sqs.getQueueAttributes(params, function(err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
          } else {
               const msgsInQueue = data.Attributes.ApproximateNumberOfMessages;
               autoscaling.describeAutoScalingGroups({
                    AutoScalingGroupNames: [process.env.ASG_NAME]
               }, function(err, data) {
                   if (err){ console.log(err, err.stack); } // an error occurred
                   else {
                        const asgSize = data.AutoScalingGroups[0].DesiredCapacity
                        console.log(`autoscaling group size ${asgSize}`);
                        console.log(`Messages in queue: ${msgsInQueue}`);
                        const backlogPerInstance = parseInt(msgsInQueue) === 0
                                                   ? 0
                                                   : asgSize === 0
                                                        ? 11
                                                        : parseInt(msgsInQueue) / asgSize;
                        console.log(`backlog per instance ${backlogPerInstance}`);

                        const params = {
                          MetricData: [
                            {
                              MetricName: process.env.QUEUE_URL.split('/').pop() + '-backlog-per-instance',
                              Unit: 'None',
                              Value: backlogPerInstance
                            }
                          ],
                          Namespace: 'YoutubeBot'
                        };

                        cw.putMetricData(params, function(err, data) {
                          if (err) {
                            console.log("Error", err);
                          } else {
                            console.log("Success", JSON.stringify(data));
                          }
                        });
                   }
               });
          }
        });
}

setInterval(calcMsgsInQueue, 60000);

http.listen(3000, () => console.log('listening on *:3000'));
