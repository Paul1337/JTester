export default {
    formatBlockTitle(blockTitle: string) {
        return blockTitle
            .split('>')
            .map((bit) => bit.trim())
            .join(' > ');
    },
};
