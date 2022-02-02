'use strict';

const reverseString = (str) => {
	// Make sure the HEX value from the integers fill 4 bytes when converted to buffer, so that they are reversed correctly
	if (str.length < 8) str = '0'.repeat(8 - str.length) + str;
	return reverseBuffer(Buffer.from(str, 'hex')).toString('hex');
}

const reverseBuffer = (src) => {
    const len = src.length;
    const buffer = Buffer.alloc(len);
    let i = 0, j = len - 1;
    for (i, j; i <= j; ++i, --j) {
        buffer[i] = src[j];
        buffer[j] = src[i];
    }
    return buffer;
}

const prettyHashrate = (hashesPerSec) => {
    const kHs = hashesPerSec / 1000;
    const MHs = kHs / 1000;
    if (MHs > 1) return 'MH/s:   ' + MHs.toLocaleString('en-gb', { maximumFractionDigits: 2 });
    else if (kHs > 1) return 'kH/s:   ' + kHs.toLocaleString('en-gb', { maximumFractionDigits: 2 });
    else return 'H/s:    ' + hashesPerSec.toLocaleString('en-gb', { maximumFractionDigits: 0 });
}

const prettyHitEst = (secs) => {
    const mins = secs / 60;
    const hours = mins / 60;
    const days = hours / 24;
    const weeks = days / 7;
    const months = days / 30.437;
    const years = months / 12;
    if (years > 1) return years.toLocaleString('en-gb', { maximumFractionDigits: 2 }) + ' years';
    else if (months > 1) return months.toLocaleString('en-gb', { maximumFractionDigits: 2 }) + ' months';
    else if (weeks > 1) return weeks.toLocaleString('en-gb', { maximumFractionDigits: 2 }) + ' weeks';
    else if (days > 1) return days.toLocaleString('en-gb', { maximumFractionDigits: 2 }) + ' days';
    else if (hours > 1) return hours.toLocaleString('en-gb', { maximumFractionDigits: 2 }) + ' hours';
    else if (mins > 1) return mins.toLocaleString('en-gb', { maximumFractionDigits: 2 }) + ' mins';
    else return secs.toLocaleString('en-gb', { maximumFractionDigits: 0 }) + ' seconds';
}

module.exports = {
    reverseString,
    reverseBuffer,
    prettyHashrate,
    prettyHitEst
}