#!/usr/bin/env node

require('@babel/register');

const { globSync } = require('glob');
const JTester = require('../index.js');
const { program } = require('commander');

const path = require('path');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json')), 'utf-8');

program.name('JTester').description('CLI tool to run jtester unit tests');

program
    .option('-p, --path <path>', 'Root path where to look for test files')
    .option('-v, --verbose', 'To see more detailed logging on what cli does, where searches');

program.parse();

const options = program.opts();

const inputPath = options.path ?? process.cwd();

const pathType = inputPath.startsWith('/') ? 'absolute' : 'relative';

if (options.verbose) console.log(`JTester runner started.. Input path = ${inputPath}`);
const rootPath = pathType === 'absolute' ? inputPath : path.join(process.cwd(), inputPath);
const resultPath = path.join(rootPath, '/**/*.test.js');
if (options.verbose) console.log(`Search path = ${resultPath}`);

const jsfiles = globSync(resultPath, { ignore: 'node_modules/**' });
if (options.verbose) console.log(`Found ${jsfiles.length} js files:`, jsfiles);

for (let method in JTester) {
    globalThis[method] = JTester[method];
}

if (jsfiles.length > config.maxFilesCnt) {
    console.error('There are too many js files, exiting...');
    process.exit(-1);
}

for (let file of jsfiles) {
    require(file);
}

JTester.afterAll(JTester.printResult);
