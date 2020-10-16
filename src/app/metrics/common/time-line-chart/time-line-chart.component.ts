import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-time-line-chart',
    templateUrl: './time-line-chart.component.html',
    styleUrls: ['./time-line-chart.component.scss'],
})
export class TimeLineChartComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    private _dataIdVal: number;

    @Input()
    set dataId(aId: number) {
        console.log('time-line-chart: got value ', aId);
        this._dataIdVal = aId;
        this._graphArea.nativeElement.innerHTML = `<p>current id is ${aId}</p>`;
    }

    get dataId(): number {
        return this._dataIdVal;
    }

    @ViewChild('graphArea')
    private _graphArea: ElementRef;
}
