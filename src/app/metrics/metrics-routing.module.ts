import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MetricsComponent } from './metrics.component';
import { DispatcherComponent } from './dispatcher/dispatcher.component';
import { CombinerComponent } from './combiner/combiner.component';
import { IngesterComponent } from './ingester/ingester.component';
import { MonitorComponent } from './monitor/monitor.component';
import { ControllerComponent } from './controller/controller.component';
import { SenderComponent } from './sender/sender.component';
import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
    {
        path: '',
        component: MetricsComponent,
        children: [
            {
                path: '',
                component: OverviewComponent
            },
            {
                path: 'sender',
                component: SenderComponent,
            },
            {
                path: 'dispatcher',
                component: DispatcherComponent,
            },
            {
                path: 'combiner',
                component: CombinerComponent,
            },
            {
                path: 'ingester',
                component: IngesterComponent,
            },
            {
                path: 'monitor',
                component: MonitorComponent,
            },
            {
                path: 'controller',
                component: ControllerComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MetricsRoutingModule {}
