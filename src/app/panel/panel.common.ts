export enum ImageFetcherCommand {
    start = 'start',
    stop = 'stop',
}

export enum ImageFetcherMsgType {
    status = 'status',
    image = 'image',
}

export function generateColorTable(): Uint32Array {
    let colorTable = new Uint32Array(256);

    // 127.0.255 => 0.0.255
    for (let i = 0; i < 28; i++) {
        let step = 127 / 27;
        let red = Math.round(127 - step * i);
        colorTable[i] = _rgb2uint(red, 0, 255);
    }

    // 0.0.255 => 0.255.255
    for (let i = 0; i < 57; i++) {
        let step = 255 / 57;
        let green = Math.round(0 + step * (i + 1));
        let ci = 28 + i;
        colorTable[ci] = _rgb2uint(0, green, 255);
    }

    // 0.255.255 => 0.255.0
    for (let i = 0; i < 57; i++) {
        let step = 255 / 57;
        let blue = Math.round(255 - step * (i + 1));
        let ci = 28 + 57 + i;
        colorTable[ci] = _rgb2uint(0, 255, blue);
    }

    // 0.255.0 => 255.255.0
    for (let i = 0; i < 57; i++) {
        let step = 255 / 57;
        let red = Math.round(0 + step * (i + 1));
        let ci = 28 + 57 * 2 + i;
        colorTable[ci] = _rgb2uint(red, 255, 0);
    }

    // 255.255.0 => 255.0.0
    for (let i = 0; i < 57; i++) {
        let step = 255 / 57;
        let green = Math.round(255 - step * (i + 1));
        let ci = 28 + 57 * 3 + i;
        colorTable[ci] = _rgb2uint(255, green, 0);
    }

    return colorTable;
}

function _rgb2uint(r: number, g: number, b: number): number {
    let littleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;
    if (littleEndian) {
        return r + (g << 8) + (b << 16) + 0xff000000;
    } else {
        return (r << 24) + (g << 16) + (b << 8) + 0xff;
    }
}
