import { Component, OnDestroy, OnInit } from '@angular/core';

import { ControllerService } from './controller.service';

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit, OnDestroy {
    constructor(private _controller: ControllerService) {}

    ngOnInit(): void {
        this._controller.imageFetcherStart();
    }

    ngOnDestroy(): void {
        this._controller.imageFetcherStop();
    }
}
