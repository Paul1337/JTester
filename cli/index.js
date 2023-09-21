#!/usr/bin/env node

// const ts = require('typescript');

require('@babel/register')({
    // presets: ['@babel/preset-typescript'],
    plugins: [['@babel/plugin-transform-modules-commonjs']],
});

const tsNodePath = require.resolve('ts-node');
const { execSync } = require('child_process');

// const { create, compile } = require('ts-node');

const { globSync } = require('glob');
const JTester = require('../lib/index.js');
const { program } = require('commander');

const path = require('path');
const fs = require('fs');
const utils = require('../lib/utils.js');
const { getFilesTemplate } = require('./utils.js');

program.name('JTester').description('CLI tool to run jtester unit tests');
program
    .option('-p, --path <path>', 'Root path where to look for test files')
    .option('-v, --verbose', 'To see more detailed logging on what cli does, where searches')
    .option('-f, --file <file>', 'To test only specific file')
    .option('--config <config_path>', 'Path to the config file, defaults to the current directory')
    .option('-l, --lang <lang>', 'javascript/typescript. Defaults to javascript.')
    .option(
        '-b, --test <test>',
        'To run only specific test by absolute title (title should be in format "some > inner > inner2")'
    );

program.parse();
const options = program.opts();

let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'defaultConfig.json')), 'utf-8');

const customConfigPath = options.config
    ? path.join(process.cwd(), options.config)
    : path.join(process.cwd(), 'jtester.config.js');

if (fs.existsSync(customConfigPath)) {
    const customConfig = require(customConfigPath);
    config = {
        ...config,
        ...(customConfig.default ?? customConfig),
    };
}

config = {
    ...config,
    ...options,
};

const inputPath = config.path ?? process.cwd();

const pathType = inputPath.startsWith('/') ? 'absolute' : 'relative';

if (config.verbose) console.log(`JTester runner started.. Input path = ${inputPath}`);
const rootPath = pathType === 'absolute' ? inputPath : path.join(process.cwd(), inputPath);

const filesTemplate = getFilesTemplate(config.lang);

const resultPath = path.join(rootPath, filesTemplate);
if (config.verbose) console.log(`Search path = ${resultPath}`);

const testFiles = globSync(resultPath, { ignore: 'node_modules/**' }).filter((file) => {
    return !config.file || file.endsWith(config.file);
});
if (config.verbose) console.log(`Found ${testFiles.length} testing files:`, testFiles);

if (config.globalContext && typeof config.globalContext === 'object') {
    for (let prop in config.globalContext) {
        globalThis[prop] = config.globalContext[prop];
    }
}

if (config.test) {
    globalThis.TEST_TITLE = utils.formatBlockTitle(config.test);
    if (config.verbose) console.log(`Looking for test: ${globalThis.TEST_TITLE}`);
}

if (config.before && typeof config.before === 'function') config.before();

if (config.lang === 'javascript') {
    for (let file of testFiles) {
        require(file);
    }
} else {
    const testFolderPath = path.join(__dirname, 'test-ts');
    const filePath = path.join(testFolderPath, 'main.ts');
    let mainScript = `import '../../src/index';\n`;

    for (let file of testFiles) {
        mainScript += `import '${file.slice(0, file.length - 3)}';\n`;
    }

    if (!fs.existsSync(testFolderPath)) {
        fs.mkdirSync(testFolderPath);
        console.log('Папка test-ts успешно создана');
    }

    fs.writeFileSync(filePath, mainScript);
    const result = execSync(`npx ts-node ${filePath}`);
    console.log(result.toString());
}

if (config.after && typeof config.after === 'function') config.after();

JTester.afterAll(JTester.printResult);
