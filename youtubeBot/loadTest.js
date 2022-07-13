const axios = require('axios');

const AUT = 'http://localhost:3000/load-test';
const requestPerSecond = 10;
const TestDurationSec = 10;


async function run(){
	const start = Date.now();
	while (Date.now() - start < TestDurationSec * 1000) {
		axios
			.get(AUT)
			.then(res => {
				console.log(`${(new Date()).toISOString()} statusCode: ${res.status}`);
				// console.log(res);
			})
			.catch(error => {
				console.error(`${(new Date()).toISOString()} statusCode: ${error.status}`);

			});
		await new Promise(resolve => setTimeout(resolve, (1 / requestPerSecond) * 1000));

	}
}

const x = Promise.resolve(run());


