import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-image-card',
    templateUrl: './image-card.component.html',
    styleUrls: ['./image-card.component.scss'],
})
export class ImageCardComponent implements OnInit, OnDestroy {
    constructor() {}

    @Input()
    set imageData(data: any) {
        let canvas = <HTMLCanvasElement>this.imageCanvas?.nativeElement;
        let context = canvas?.getContext('2d');
        if (!context) return;
        // clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText('' + data.count, 100, 100);
    }

    imageWidth: number = 450;
    imageHeight: number = 450;

    @ViewChild('imageCanvas')
    imageCanvas: ElementRef;

    ngOnInit(): void {}

    ngOnDestroy(): void {}
}
