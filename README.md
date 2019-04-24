# danger-plugin-tslint

Add tslint errors and warnings to your Danger output

## Usage

Install the package to your devDependencies

```bash
npm install @awam/danger-plugin-tslint --save-dev
# or
yarn add @awam/danger-plugin-tslint --dev
```

Add the package to your dangerfile

```js
import tslint from '@awam/danger-plugin-tslint';
import { join } from 'path'
async function main() {
  await tslint().
  // supply a tslint file in a different location
  await tslint({ tslintConfigurationPath: join(process.cwd(), 'config', 'tslint.json' )}),
  // supply other file extensions to be linted
  await tslint({ fileExtensions: [ '.ts', '.tsx', '.js' ]}),
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    fail(err.toString());
    process.exit(1);
});
```

This plugin will leave no output if no errors or warnings exist.
If tslint fails to parse the config file then the error message will be reported as a fail.
