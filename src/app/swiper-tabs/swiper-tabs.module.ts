import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperTabGroupComponent } from './swiper-tab-group/swiper-tab-group.component';
import { SwiperTabComponent } from './swiper-tab/swiper-tab.component';
import { SwiperTabHeaderComponent } from './swiper-tab-header/swiper-tab-header.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, MatButtonModule],
  declarations: [
    SwiperTabGroupComponent,
    SwiperTabComponent,
    SwiperTabHeaderComponent
  ],
  providers: [],
  exports: [SwiperTabGroupComponent, SwiperTabComponent]
})
export class SwiperTabsModule {}
