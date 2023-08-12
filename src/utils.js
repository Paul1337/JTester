module.exports = {
    formatBlockTitle(blockTitle) {
        return blockTitle
            .split('>')
            .map((bit) => bit.trim())
            .join(' > ');
    },
};
