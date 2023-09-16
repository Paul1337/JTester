"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    formatBlockTitle(blockTitle) {
        return blockTitle
            .split('>')
            .map((bit) => bit.trim())
            .join(' > ');
    },
};
