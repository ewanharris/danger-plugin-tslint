/* global process, fail */

// requires
const tslint = require('.').default;
const path = require('path');
async function main() {
	await Promise.all([
		tslint({ configurationPath: path.join(__dirname, 'tslint.json' )})
	]);
}
main()
	.then(() => process.exit(0))
	.catch(err => {
		fail(err.toString());
		process.exit(1);
	});
