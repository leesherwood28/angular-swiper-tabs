import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-swiper-tab',
  templateUrl: './swiper-tab.component.html',
  styleUrls: ['./swiper-tab.component.css']
})
export class SwiperTabComponent implements OnInit {
  @Input() label: string;

  constructor() {}

  ngOnInit() {}
}
