import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './panel.component';
import { ImageCardComponent } from './image-card/image-card.component';

@NgModule({
    declarations: [PanelComponent, ImageCardComponent],
    imports: [CommonModule, FormsModule, PanelRoutingModule],
})
export class PanelModule {}
