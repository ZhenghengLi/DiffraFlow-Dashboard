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

    public options: any;
    public initOpts: any = {
        renderer: 'svg',
    };
    @Input()
    title: string = 'title';
    @Input()
    yLabel: string = 'ylabel';

    @Input()
    set dataId(anId: number) {
        console.log('time-line-chart: got value ', anId);
        this._dataIdVal = anId;
        this._updateOptions();
    }

    get dataId(): number {
        return this._dataIdVal;
    }

    private _updateOptions(): void {
        const data1 = [];

        let currentTime = new Date().getTime() + 0;
        for (let i = 0; i <= 60; i++) {
            data1.push([currentTime - i * 1000, 1.5 + Math.sin((i - this._dataIdVal * 0.5) / 5)]);
        }

        this.options = {
            title: {
                text: this.title,
                left: 'center',
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: 20,
                },
            },
            grid: {
                left: 30,
                bottom: 30,
                right: 70,
                top: 35,
            },
            xAxis: {
                boundaryGap: false,
                type: 'time',
                interval: 10000,
                axisLabel: {
                    formatter: (value) => {
                        return new Date(value).toLocaleTimeString('en-US', { hour12: false });
                    },
                },
            },
            yAxis: {
                position: 'right',
                name: this.yLabel,
                nameTextStyle: {
                    fontSize: 14,
                    padding: 35,
                },
                nameLocation: 'center',
            },
            series: [
                {
                    type: 'line',
                    symbol: 'none',
                    lineStyle: {
                        color: 'green',
                    },
                    data: data1,
                    areaStyle: {
                        color: 'lightgreen',
                    },
                    animationDelay: (idx) => idx * 10,
                },
            ],
            animationEasing: 'elasticOut',
            animationDelayUpdate: (idx) => idx * 5,
        };
    }
}
