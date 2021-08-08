import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwiperTabComponent } from '../swiper-tab/swiper-tab.component';

@Component({
  selector: 'app-swiper-tab-group',
  templateUrl: './swiper-tab-group.component.html',
  styleUrls: ['./swiper-tab-group.component.css']
})
export class SwiperTabGroupComponent implements OnInit {
  activeIndex$ = new BehaviorSubject<number>(0);

  @ContentChildren(SwiperTabComponent) tabs: QueryList<SwiperTabComponent>;

  constructor() {}

  ngOnInit() {}
}
