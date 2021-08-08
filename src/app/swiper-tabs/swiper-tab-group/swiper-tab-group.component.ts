import {
  Component,
  ContentChildren,
  ElementRef,
  OnInit,
  Query,
  QueryList,
  ViewChildren
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { SwiperTabHeaderComponent } from '../swiper-tab-header/swiper-tab-header.component';
import { SwiperTabComponent } from '../swiper-tab/swiper-tab.component';

@Component({
  selector: 'app-swiper-tab-group',
  templateUrl: './swiper-tab-group.component.html',
  styleUrls: ['./swiper-tab-group.component.css']
})
export class SwiperTabGroupComponent implements OnInit {
  readonly activeIndex$ = new BehaviorSubject<number>(0);

  readonly hostWidth$ = new Subject<number>();
  readonly headerWidth$ = new Subject<number>();

  readonly tabTranslateX$ = combineLatest([
    this.activeIndex$,
    this.hostWidth$
  ]).pipe(
    map(([activeIndex, hostWidth]) => -activeIndex * hostWidth),
    debounceTime(0)
  );

  readonly headerTranslateX$ = combineLatest([
    this.activeIndex$,
    this.headerWidth$
  ]).pipe(
    map(([activeIndex, headerWidth]) => activeIndex * headerWidth),
    debounceTime(0)
  );

  @ContentChildren(SwiperTabComponent) tabs: QueryList<SwiperTabComponent>;

  @ViewChildren(SwiperTabHeaderComponent) headers: QueryList<
    SwiperTabHeaderComponent
  >;

  constructor(
    private host: ElementRef<HTMLElement>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.populateHostWidth();
    this.populateHeaderWidth();
  }

  private populateHostWidth() {
    const boundingRect = this.host.nativeElement.getBoundingClientRect();
    this.hostWidth$.next(boundingRect.width);
  }

  private populateHeaderWidth() {
    const headerEl = this.headers.toArray()[0].element.nativeElement;
    const boundingRect = headerEl.getBoundingClientRect();
    this.headerWidth$.next(boundingRect.width);
  }

  setActiveIndex(index: number) {
    this.activeIndex$.next(index);
  }

  onPan(e) {
    console.log(e);
  }
}
