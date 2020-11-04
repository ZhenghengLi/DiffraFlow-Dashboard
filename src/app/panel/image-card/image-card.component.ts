import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-image-card',
    templateUrl: './image-card.component.html',
    styleUrls: ['./image-card.component.scss'],
})
export class ImageCardComponent implements OnInit, OnDestroy {
    constructor() {}

    private _imageData: ImageData;
    private _colorTable: Uint32Array;

    imageWidth: number = 10;
    imageHeight: number = 10;

    @ViewChild('imageCanvas')
    imageCanvas: ElementRef;

    @Input()
    set imageData(data: ImageData) {
        this._imageData = data;
        this.render();
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {}

    render() {
        let canvas = <HTMLCanvasElement>this.imageCanvas?.nativeElement;
        let context = canvas?.getContext('2d');
        if (!context) return;
        // clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // -- draw image data ------------------------------
        // context.fillText('' + data.count, 2, 5);
        let imageDat = new ImageData(10, 10);
        let imageBuf = new Uint32Array(imageDat.data.buffer);
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                let idx = y * 10 + x;
                imageBuf[idx] = (255 << 24) + ((x * 10 * 2) << 8) + y * 10 * 2;
            }
        }
        context.putImageData(imageDat, 0, 0);
    }
}
