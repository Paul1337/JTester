module.exports.isTestProp = (expectation, prop) => {
    return typeof expectation[prop] === 'function' && prop.startsWith('to');
};
