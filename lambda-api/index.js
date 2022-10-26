var mysql = require('mysql');
var AWS = require('aws-sdk');

var secret_name = process.env.SECRET_NAME;
var db_name = 'moviesdb';
var table_name = 'movies';

var client = new AWS.SecretsManager({region: 'us-east-1'});
var connection;
var secret;

exports.handler =  async function(event, context) {
    const promise = new Promise(function(resolve, reject) {
        client.getSecretValue({SecretId: secret_name}, function(err, data) {
            if (err) {
                console.log(err)
                if (err.code === 'DecryptionFailureException')
                    // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'InternalServiceErrorException')
                    // An error occurred on the server side.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'InvalidParameterException')
                    // You provided an invalid value for a parameter.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'InvalidRequestException')
                    // You provided a parameter value that is not valid for the current state of the resource.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
                else if (err.code === 'ResourceNotFoundException')
                    // We can't find the resource that you asked for.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    throw err;
            }
            else {
                // Decrypts secret using the associated KMS CMK.
                // Depending on whether the secret is a string or binary, one of these fields will be populated.
                secret = JSON.parse(data.SecretString);
                console.log(data)
            }

            if (!connection){
                var connection = mysql.createConnection({
                  host: secret.host,
                  user: secret.username,
                  password: secret.password,
                  database: db_name
                });
                connection.connect();
            }

            console.log(event);
            connection.query('select Name from ' + table_name + ' where id=' + event.queryStringParameters.id, function (error, results, fields) {
              if (error) throw error;

              console.log('The solution is: ', results);
              resolve({
                 "statusCode": 200,
                 "body": JSON.stringify(results)
              })
            });
        });
    })
    return promise
}