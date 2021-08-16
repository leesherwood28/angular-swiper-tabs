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
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  OperatorFunction,
  Observable,
  merge
} from 'rxjs';
import { debounceTime, map, scan, startWith, tap } from 'rxjs/operators';
import { SwiperTabHeaderComponent } from '../swiper-tab-header/swiper-tab-header.component';
import { SwiperTabComponent } from '../swiper-tab/swiper-tab.component';

export interface Pan {
  position: number;
  velocity: number;
  isPanning: boolean;
}

export interface State {
  activeIndex: number;
  isPanning: boolean;
  panPosition?: number;
  hostWidth?: number;
  headerWidth?: number;
}

@Component({
  selector: 'app-swiper-tab-group',
  templateUrl: './swiper-tab-group.component.html',
  styleUrls: ['./swiper-tab-group.component.css']
})
export class SwiperTabGroupComponent implements OnInit {
  // Input observables
  readonly requestedIndex$ = new Subject<number>();
  readonly hostWidth$ = new Subject<number>();
  readonly headerWidth$ = new Subject<number>();
  readonly panning$ = new Subject<Pan>();

  // State
  readonly initState: State = { activeIndex: 0, isPanning: false };

  readonly state$ = merge(
    this.requestedIndex$.pipe(map(activeIndex => ({ activeIndex }))),
    this.hostWidth$.pipe(map(hostWidth => ({ hostWidth }))),
    this.headerWidth$.pipe(map(headerWidth => ({ headerWidth }))),
    this.panning$.pipe(
      map(pan => ({ isPanning: pan.isPanning, panPosition: pan.position }))
    )
  ).pipe(scan((acc, curr) => ({...acc, ...curr}), this.initState));

  // Outputs

  readonly tabTranslateX1$ = combineLatest([
    this.requestedIndex$,
    this.hostWidth$
  ]).pipe(
    map(([activeIndex, hostWidth]) => -activeIndex * hostWidth),
    debounceTime(0)
  );

  readonly tabTranslateX$ = combineLatest([this.panning$]).pipe(
    map(([e]) => e.position),
    debounceTime(0)
  );

  readonly headerTranslateX$ = combineLatest([
    this.requestedIndex$,
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
    this.requestedIndex$.next(index);
  }

  onPan(e) {
    this.panning$.next({
      position: e.deltaX,
      isPanning: !e.isFinal,
      velocity: e.velocityX
    });
    console.log(e);
  }
}
