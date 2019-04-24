
// Provides dev-time typing structure for  `danger` - doesn't affect runtime.
import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
declare var danger: DangerDSLType;
export declare function warn (message: string, filePath?: string, line?: number): void;
export declare function fail (message: string, filePath?: string, line?: number): void;

import * as path from 'path';
import { Configuration, Linter } from 'tslint';
import {  IConfigurationFile } from 'tslint/lib/configuration';

export interface DangerTSLintOptions {
	configurationPath: string
}

export default function tslint(options: DangerTSLintOptions) {
	const files = danger.git.created_files.concat(danger.git.modified_files);

	const tslintOptions = {
		fix: false,
		formatter: 'json'
	};
	const linter = new Linter(tslintOptions);
	const configuration: IConfigurationFile = Configuration.loadConfigurationFromPath(options.configurationPath);
	const lintFiles = files.filter(file => !Configuration.isFileExcluded(file, configuration));
	return Promise.all(lintFiles.map(file => lintFile(linter, configuration, file)));
}

async function lintFile (linter: Linter, config: IConfigurationFile, filePath: string) {
	const fileContents = await danger.github.utils.fileContents(filePath);
	linter.lint(filePath, fileContents, config);
	const results = linter.getResult();

	if (results.errorCount || results.warningCount) {
		for (const failure of results.failures) {
			const position = failure.getStartPosition();
			const { line } = position.getLineAndCharacter();
			const fileName = path.basename(failure.getFileName());
			const message = `${failure.getFailure()} line - ${fileName} (${failure.getRuleName()})`;
			if (failure.getRuleSeverity() === 'warning') {
				warn(message, filePath, line);
			}

			if (failure.getRuleSeverity() === 'error') {
				fail(message, filePath, line);
			}
		}
	}
}
