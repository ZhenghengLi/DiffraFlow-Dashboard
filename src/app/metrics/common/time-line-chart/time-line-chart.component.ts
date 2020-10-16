import { Component, Input, OnInit } from '@angular/core';

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
    }

    get dataId(): number {
        return this._dataIdVal;
    }
}
