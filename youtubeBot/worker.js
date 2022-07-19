"use strict";

const fs = require('fs');
const ytdl = require('ytdl-core');
const AWS = require('aws-sdk');
var ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();

const s3 = new AWS.S3();
const sqs = new AWS.SQS({region: process.env.SQS_REGION});


function handleMsg(item) {
    const filename = `${item.id}.mp4`;
    const frames_dir = item.id;

    // downloading the first search result...
    ytdl(item.url)
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
            }).run();
    });
}

const consume = () => new Promise((resolve, reject) => {
        console.log('fetching messages');
        sqs.receiveMessage({
            MaxNumberOfMessages: 1,
            MessageAttributeNames: ["All"],
            QueueUrl: process.env.QUEUE_URL,
            WaitTimeSeconds: 10
        }, function(err, data) {
          if (err) {
            console.log("Receive Error", err);
          } else if (data.Messages) {
            handleMsg(JSON.parse(data.Messages[0].Body));
            sqs.deleteMessage({
                QueueUrl: process.env.QUEUE_URL,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            }, function() { resolve() });
          } else {
            resolve();
          }
        });
});


async function run() {
    while (true) {
        await consume();
    }
}

const x = Promise.resolve(run());
