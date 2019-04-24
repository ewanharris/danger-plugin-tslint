/* global process, fail */

// requires
const tslint = require('.').default;
const path = require('path');
async function main() {
	await Promise.all([
		tslint()
	]);
}
main()
	.then(() => process.exit(0))
	.catch(err => {
		fail(err.toString());
		process.exit(1);
	});
