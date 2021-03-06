import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'app-swiper-tab-header',
  templateUrl: './swiper-tab-header.component.html',
  styleUrls: ['./swiper-tab-header.component.css']
})
export class SwiperTabHeaderComponent implements OnInit {
  @Input() label: string;
  constructor(public element: ElementRef<HTMLElement>) {}

  ngOnInit() {}
}
