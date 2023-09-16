exports.getFilesTemplate = (lang) => {
    const defaultValue = '/**/*.test.js';
    if (lang === 'javascript') {
        return '/**/*.test.js';
    } else if (lang === 'typescript') {
        return '/**/*.test.ts';
    }
    return defaultValue;
};
