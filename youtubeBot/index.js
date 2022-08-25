"use strict";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const fs = require('fs');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const AWS = require('aws-sdk');
var ffmpeg = require('fluent-ffmpeg');
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

const s3 = new AWS.S3();


app.get('/status', (req, res) => {
	res.sendStatus(200);
});

let healthCount = 0;

app.get('/healthz', (req, res) => {
    healthCount = healthCount + 1;
    if (healthCount > 10) {
        res.sendStatus(500);
    } else {
        res.sendStatus(200);
    }
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

	// bot.sendMessage(chatId, 'Downloading....');

	// searching in youtube....
	ytsr(msg, {limit: 1, pages: 1}).then((result) => {
		console.log(result.items[0]);

		if (result.items.length > 0){
			const filename = `${result.items[0].id}.mp4`;
			const frames_dir = result.items[0].id;

			// downloading the first search result...
			ytdl(result.items[0].url)
				.pipe(fs.createWriteStream(filename)).on('finish', () => {
				console.log(`File downloaded: ${filename}`);

				if (!fs.existsSync(frames_dir)){
					fs.mkdirSync(frames_dir);
				}

				console.log(`Extracting frames from ${filename}`);

				// extract video frames every 1 seconds using ffmpeg
				ffmpeg(filename).addOptions(['-r 1']).output(`${frames_dir}/%d.png`)
					.on('progress', function(info) {
						console.log('progress ' + info.percent + '%');
					})
					.on('end', function () {

						// upload frames to s3
						fs.readdir(frames_dir, (err, files) => {
							files.forEach(file => {
								const frame_file = `${frames_dir}/${file}`;
								console.log(`Uploading ${frame_file}`);

								s3.upload({
									Bucket: process.env.BUCKET_NAME,
									Key: frame_file,
									Body: fs.readFileSync(frame_file)
								}, function(err, data) {
									if (err) {
										console.log(`Failed to upload file ${frame_file} ${err}`);
									} else {
										console.log(`File uploaded successfully. ${frame_file}`);
									}
								});
							});
						});

						res.json({
							'text': result.items[0].title,
							'link': result.items[0].url,
							'videoId': result.items[0].id
						});
					}).run();
			});
		} else {
			res.json({'text': `No video found for ${msg}... `});
		}

	}).catch((err) => {
		console.log(err);
		res.json({'text': 'Something went wrong... please try again'});
	});
});

http.listen(3000, () => console.log('listening on *:3000'));
