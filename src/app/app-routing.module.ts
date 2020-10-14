import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'metrics',
        loadChildren: () => import('./metrics/metrics.module').then((m) => m.MetricsModule),
    },
    {
        path: 'panel',
        loadChildren: () => import('./panel/panel.module').then((m) => m.PanelModule),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
