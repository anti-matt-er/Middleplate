const fs = require('fs');

const src = './src/';

const getEntries = (dir) =>
    fs
        .readdirSync(`${src}${dir}`, { withFileTypes: true })
        .filter((item) => !item.isDirectory())
        .map((item) => `${src}${dir}/${item.name}`);

const config = {
    entry: getEntries('mjs'),
    mode: 'production',
    output: {
        filename: 'main.bundle.js'
    }
};

module.exports = config;
