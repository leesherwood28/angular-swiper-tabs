import { Template } from '@angular/compiler/src/render3/r3_ast';
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-swiper-tab',
  templateUrl: './swiper-tab.component.html',
  styleUrls: ['./swiper-tab.component.css']
})
export class SwiperTabComponent implements OnInit {
  @Input() label: string;

  @ViewChild(TemplateRef, { static: true }) contentRef;

  constructor() {}

  ngOnInit() {}
}
