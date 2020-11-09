import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './panel.component';
import { ImageCardComponent } from './image-card/image-card.component';

@NgModule({
    declarations: [PanelComponent, ImageCardComponent],
    imports: [SharedModule, PanelRoutingModule],
})
export class PanelModule {}
