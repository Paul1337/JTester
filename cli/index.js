#!/usr/bin/env node

require('@babel/register')({
    // presets: ['@babel/preset-env'],
    plugins: [['@babel/plugin-transform-modules-commonjs']],
});

const { globSync } = require('glob');
const JTester = require('../index.js');
const { program } = require('commander');

const path = require('path');
const fs = require('fs');

let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'defaultConfig.json')), 'utf-8');

const customConfigPath = path.join(process.cwd(), 'jtester.config.js');
if (fs.existsSync(customConfigPath)) {
    const customConfig = require(customConfigPath);
    config = {
        ...config,
        ...(customConfig.default ?? customConfig),
    };
}

program.name('JTester').description('CLI tool to run jtester unit tests');
program
    .option('-p, --path <path>', 'Root path where to look for test files')
    .option('-v, --verbose', 'To see more detailed logging on what cli does, where searches')
    .option('-f, --file <file>', 'To test only specific file')
    .option(
        '-b, --block <block>',
        'To run only specific test block (block name is the first argument of test() function)'
    );

program.parse();

const options = program.opts();
config = {
    ...config,
    ...options,
};

const inputPath = config.path ?? process.cwd();

const pathType = inputPath.startsWith('/') ? 'absolute' : 'relative';

if (config.verbose) console.log(`JTester runner started.. Input path = ${inputPath}`);
const rootPath = pathType === 'absolute' ? inputPath : path.join(process.cwd(), inputPath);
const resultPath = path.join(rootPath, '/**/*.test.js');
if (config.verbose) console.log(`Search path = ${resultPath}`);

const jsfiles = globSync(resultPath, { ignore: 'node_modules/**' }).filter((file) => {
    return !config.file || file.endsWith(config.file);
});
if (config.verbose) console.log(`Found ${jsfiles.length} js files:`, jsfiles);

for (let prop in JTester) {
    globalThis[prop] = JTester[prop];
}

if (config.globalContext && typeof config.globalContext === 'object') {
    for (let prop in config.globalContext) {
        globalThis[prop] = config.globalContext[prop];
    }
}

if (config.block) {
    globalThis.BLOCK_TITLE = config.block;
}

if (config.before && typeof config.before === 'function') config.before();

for (let file of jsfiles) {
    require(file);
}

if (config.after && typeof config.after === 'function') config.after();

JTester.afterAll(JTester.printResult);
