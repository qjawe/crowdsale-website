'use strict';

function hex2int (hex) {
    if (typeof hex !== 'string' || hex.substring(0, 2) !== '0x') {
        throw new Error('hex must be a `0x` prefixed string');
    }

    return parseInt(hex.substring(2), 16);
}

function int2hex (int) {
    return `0x${int.toString(16)}`;
}

function hex2buf (hex) {
    if (typeof hex !== 'string' || hex.substring(0, 2) !== '0x') {
        throw new Error('hex must be a `0x` prefixed string');
    }

    return Buffer.from(hex.substring(2), 'hex');
}

function buf2hex (buf) {
    return `0x${buf.toString('hex')}`;
}

function pause (time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

module.exports = {
    hex2int,
    int2hex,
    hex2buf,
    buf2hex,
    pause
};
