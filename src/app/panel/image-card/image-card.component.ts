import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { generateColorTable } from '../panel.common';

@Component({
    selector: 'app-image-card',
    templateUrl: './image-card.component.html',
    styleUrls: ['./image-card.component.scss'],
})
export class ImageCardComponent implements OnInit, OnDestroy {
    constructor() {}

    private _imageData: ImageData;
    private _colorTable: Uint32Array;
    private _minEnergy: number = 0;
    private _maxEnergy: number = 0;

    @ViewChild('imageCanvas')
    imageCanvas: ElementRef;

    @ViewChild('colorBarCanvas')
    colorBarCanvas: ElementRef;

    @Input()
    set imageData(data: ImageData) {
        this._imageData = data;
        if (this._imageData) {
            this.render(0, 0, this._imageData.width, this._imageData.height);
        }
    }

    @Input()
    set energyRange(data: [number, number]) {
        if (data[1] <= data[0]) return;
        if (data[0] === this._minEnergy && data[1] === this._maxEnergy) return;
        [this._maxEnergy, this._maxEnergy] = data;
        this.renderColorTable();
    }

    ngOnInit(): void {
        this._colorTable = generateColorTable();
    }

    ngOnDestroy(): void {}

    render(w0: number, h0: number, dw: number, dh: number) {
        // check parameters
        if (w0 < 0 || h0 < 0 || dw < 0 || dh < 0) return;
        // image
        let imageCanvasElement = <HTMLCanvasElement>this.imageCanvas?.nativeElement;
        let imageCanvasContext = imageCanvasElement?.getContext('2d');
        if (!imageCanvasContext) return;
        // clear and draw
        imageCanvasElement.width = dw;
        imageCanvasElement.height = dh;
        imageCanvasContext.clearRect(0, 0, imageCanvasElement.width, imageCanvasElement.height);
        imageCanvasContext.putImageData(this._imageData, 0, 0, w0, h0, dw, dh);
    }

    renderColorTable() {
        if (this._maxEnergy <= this._minEnergy) return;
        let colorBarCanvasElement = <HTMLCanvasElement>this.colorBarCanvas?.nativeElement;
        let colorBarCanvasContext = colorBarCanvasElement?.getContext('2d');
        if (!colorBarCanvasContext) return;
        // draw color bar
        let [width, height] = [colorBarCanvasElement.width, colorBarCanvasElement.height];
        colorBarCanvasContext.clearRect(0, 0, width, height);
        let colorBarWidth = width * 0.4;
        let imageData = new ImageData(colorBarWidth, height);
        let imageDataBuffer = new Uint32Array(imageData.data.buffer);
        for (let i = 0; i < imageDataBuffer.length; i++) {
            let h = Math.round(i / colorBarWidth);
            let colorIndex = Math.round(((height - h) / height) * 255);
            imageDataBuffer[i] = this._colorTable[colorIndex];
        }
        colorBarCanvasContext.putImageData(imageData, 0, 0);
        colorBarCanvasContext.lineWidth = 2;
        colorBarCanvasContext.beginPath();
        colorBarCanvasContext.moveTo(colorBarWidth, 0);
        colorBarCanvasContext.lineTo(colorBarWidth, height);
        colorBarCanvasContext.stroke();
        // draw energy text
        let energyGap = this._maxEnergy - this._minEnergy;
        let tickNumber = 10;
        let tickStep = Math.round(energyGap / tickNumber);
        let [tickW0, tickW1, tickWt] = [width * 0.3, width * 0.4, width * 0.5];
        colorBarCanvasContext.font = '24px Verdana';
        colorBarCanvasContext.textAlign = 'start';
        colorBarCanvasContext.textBaseline = 'middle';
        for (let tickValue = Math.round(this._minEnergy); tickValue < this._maxEnergy; tickValue += tickStep) {
            let hRatio = 1 - (tickValue - this._minEnergy) / energyGap;
            if (hRatio < 0.05 || hRatio > 0.95) continue;
            let tickH = hRatio * height;
            colorBarCanvasContext.beginPath();
            colorBarCanvasContext.moveTo(tickW0, tickH);
            colorBarCanvasContext.lineTo(tickW1, tickH);
            colorBarCanvasContext.stroke();
            colorBarCanvasContext.fillText('' + tickValue, tickWt, tickH);
        }
    }
}
