import * as path from 'path';
import tslint from './index';

const DEFAULT_CONFIG = path.join(__dirname, 'fixtures', 'tslint.json');
const CONFIG_WITH_JS = path.join(__dirname, 'fixtures', 'tslint-with-js.json');
const CONFIG_WITH_ERROR = path.join(__dirname, 'fixtures', 'tslint-with-errors.json');

const mockFileContents = (contents: string) => {
	const asyncContents: Promise<string> = new Promise((resolve, reject) => resolve(contents));
	return async (filePath: string): Promise<string> => asyncContents;
};

describe('tslint', () => {
	beforeEach(() => {
		global.warn = jest.fn();
		global.fail = jest.fn();
		global.danger = { utils: { sentence: jest.fn() } };
	});

	afterEach(() => {
		global.warn = undefined;
		global.fail = undefined;
	});

	it('does not lint when not valid files', async () => {
		global.danger = {
			github: { pr: { title: 'Test' } },
			git: { created_files: [], modified_files: [] },
		};

		await tslint({ tslintConfigurationPath: DEFAULT_CONFIG });

		expect(global.fail).not.toHaveBeenCalled();
		expect(global.warn).not.toHaveBeenCalled();
	});

	it('does not report when valid file that is lint ok is in pr', async () => {
		global.danger = {
			github: {
				pr: { title: 'Test' },
				utils: { fileContents: mockFileContents(`const answerToTheUltimateQuestionOfLifeTheUniverseAndEverything: number = 42;`) }
			},
			git: { created_files: ['test.ts'], modified_files: [] }
		};

		await tslint({ tslintConfigurationPath: DEFAULT_CONFIG });

		expect(global.fail).not.toHaveBeenCalled();
		expect(global.warn).not.toHaveBeenCalled();
	});

	it('does not report when valid file that is lint ok is in pr', async () => {
		global.danger = {
			github: {
				pr: { title: 'Test' },
				utils: { fileContents: mockFileContents(`const answerToTheUltimateQuestionOfLifeTheUniverseAndEverything: number = 42;`) }
			},
			git: { created_files: ['test.ts'], modified_files: [] }
		};

		await tslint({ tslintConfigurationPath: DEFAULT_CONFIG });

		expect(global.fail).not.toHaveBeenCalled();
		expect(global.warn).not.toHaveBeenCalled();
	});

	it('should report failures', async () => {
		global.danger = {
			github: {
				pr: { title: 'Test' },
				utils: { fileContents: mockFileContents(`
					const foo: string = "foo";
					const bar: string = "bar";
				`) }
			},
			git: { created_files: ['test.ts'], modified_files: [] }
		};

		await tslint({ tslintConfigurationPath: DEFAULT_CONFIG });

		expect(global.fail).toHaveBeenCalledTimes(2);
		expect(global.fail).toHaveBeenNthCalledWith(1, '\" should be \' line - test.ts (quotemark)', 'test.ts', 1);
		expect(global.fail).toHaveBeenNthCalledWith(2, '\" should be \' line - test.ts (quotemark)', 'test.ts', 2);
		expect(global.warn).not.toHaveBeenCalled();
	});

	it('should report errors', async () => {
		global.danger = {
			github: {
				pr: { title: 'Test' },
				utils: { fileContents: mockFileContents(`
					const foo: string = 'foo'
					const bar: string = 'bar'
				`) }
			},
			git: { created_files: ['test.ts'], modified_files: [] }
		};

		await tslint({ tslintConfigurationPath: DEFAULT_CONFIG });

		expect(global.fail).not.toHaveBeenCalled();
		expect(global.warn).toHaveBeenCalledTimes(2);
		expect(global.warn).toHaveBeenNthCalledWith(1, 'Missing semicolon line - test.ts (semicolon)', 'test.ts', 1);
		expect(global.warn).toHaveBeenNthCalledWith(2, 'Missing semicolon line - test.ts (semicolon)', 'test.ts', 2);
	});

	it('should filter js if desired', async () => {
		global.danger = {
			github: {
				pr: {
					title: 'Test'
				},
				utils: {
					fileContents: mockFileContents(`
						const foo = 'foo'
						const bar = 'bar'
					`)
				}
			},
			git: {
				created_files: [ path.join(__dirname, 'fixtures', 'test.js') ],
				modified_files: []
			}
		};

		await tslint({ tslintConfigurationPath: DEFAULT_CONFIG });

		expect(global.fail).not.toHaveBeenCalled();
		expect(global.warn).not.toHaveBeenCalled();
	});

	it('should report js if desired', async () => {
		const filePath = path.join(__dirname, 'fixtures', 'test.js');
		global.danger = {
			github: {
				pr: {
					title: 'Test'
				},
				utils: {
					fileContents: mockFileContents(`
						const foo = "foo"
						const bar = "bar"
					`)
				}
			},
			git: {
				created_files: [ filePath ],
				modified_files: []
			}
		};

		await tslint({ tslintConfigurationPath: CONFIG_WITH_JS, fileExtensions: [ '.js', '.ts' ] });

		expect(global.fail).toHaveBeenCalledTimes(2);
		expect(global.fail).toHaveBeenNthCalledWith(1, '\" should be \' line - test.js (quotemark)', filePath, 1);
		expect(global.fail).toHaveBeenNthCalledWith(2, '\" should be \' line - test.js (quotemark)', filePath, 2);
		expect(global.warn).toHaveBeenCalledTimes(2);
		expect(global.warn).toHaveBeenNthCalledWith(1, 'Missing semicolon line - test.js (semicolon)', filePath, 1);
		expect(global.warn).toHaveBeenNthCalledWith(2, 'Missing semicolon line - test.js (semicolon)', filePath, 2);
	});

	it('should handle an invalid tslint file', async () => {
		global.danger = {
			github: {
				pr: { title: 'Test' },
				utils: { fileContents: mockFileContents(`
					const foo: string = 'foo'
					const bar: string = 'bar'
				`) }
			},
			git: { created_files: ['test.ts'], modified_files: [] }
		};

		await tslint({ tslintConfigurationPath: CONFIG_WITH_ERROR });

		expect(global.fail).toHaveBeenCalledTimes(1);
		expect(global.fail).toHaveBeenLastCalledWith(`Invalid tslint configuration file ${CONFIG_WITH_ERROR}`, 'Invalid \"extends\" configuration value - could not require \"foo\". Review the Node lookup algorithm (https://nodejs.org/api/modules.html#modules_all_together) for the approximate method TSLint uses to find the referenced configuration file.');
		expect(global.warn).not.toHaveBeenCalled();
	});
});
