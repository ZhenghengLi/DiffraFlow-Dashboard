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

    @ViewChild('imageCanvas')
    imageCanvas: ElementRef;

    @Input()
    set imageData(data: ImageData) {
        this._imageData = data;
        if (this._imageData) {
            this.calculateColor();
            this.render(0, 0, this._imageData.width, this._imageData.height);
        }
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {}

    calculateColor() {
        if (!this._imageData) return;
        let buffer = new Uint32Array(this._imageData.data.buffer);
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] > 255) {
                buffer[i] = 0;
            } else {
                buffer[i] += 0xff000000;
            }
        }
    }

    render(w0: number, h0: number, dw: number, dh: number) {
        // check parameters
        if (w0 < 0 || h0 < 0 || dw < 0 || dh < 0) return;
        let canvas = <HTMLCanvasElement>this.imageCanvas?.nativeElement;
        let context = canvas?.getContext('2d');
        if (!context) return;
        // clear and draw
        canvas.width = dw;
        canvas.height = dh;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.putImageData(this._imageData, 0, 0, w0, h0, dw, dh);
    }
}
