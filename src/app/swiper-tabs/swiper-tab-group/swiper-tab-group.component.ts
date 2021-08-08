import {
  Component,
  ContentChildren,
  ElementRef,
  OnInit,
  QueryList
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { SwiperTabComponent } from '../swiper-tab/swiper-tab.component';

@Component({
  selector: 'app-swiper-tab-group',
  templateUrl: './swiper-tab-group.component.html',
  styleUrls: ['./swiper-tab-group.component.css']
})
export class SwiperTabGroupComponent implements OnInit {
  readonly activeIndex$ = new BehaviorSubject<number>(0);

  readonly hostWidth$ = new Subject<number>();

  readonly tabTranslateX$ = combineLatest([
    this.activeIndex$,
    this.hostWidth$
  ]).pipe(
    map(([activeIndex, hostWidth]) => -activeIndex * hostWidth),
    debounceTime(0),
    tap(i => console.log(i))
  );

  @ContentChildren(SwiperTabComponent) tabs: QueryList<SwiperTabComponent>;

  constructor(
    private host: ElementRef<HTMLElement>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.tabTranslateX$.subscribe(console.log);
  }

  ngAfterViewInit() {
    this.populateHostWidth();
  }

  private populateHostWidth() {
    const boundingRect = this.host.nativeElement.getBoundingClientRect();
    this.hostWidth$.next(boundingRect.width);
  }

  setActiveIndex(index: number) {
    this.activeIndex$.next(index);
  }
}
