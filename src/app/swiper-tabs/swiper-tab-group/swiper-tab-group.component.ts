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
  merge,
  animationFrameScheduler
} from 'rxjs';
import { debounceTime, map, scan, startWith, tap } from 'rxjs/operators';
import { SwiperTabHeaderComponent } from '../swiper-tab-header/swiper-tab-header.component';
import { SwiperTabComponent } from '../swiper-tab/swiper-tab.component';

export interface Pan {
  position: number;
  velocity: number;
  isPanning: boolean;
}

export type StateInput =
  | { type: 'pan'; pan: Pan }
  | { type: 'hostWidth'; hostWidth: number }
  | { type: 'headerWidth'; headerWidth: number }
  | { type: 'requestedIndex'; requestedIndex: number };

export interface State {
  activeIndex: number;
  tabCount: number;
  headerPosition?: number;
  tabPosition?: number;
  hostWidth?: number;
  headerWidth?: number;
  animating?: boolean;
}

function getPosition(width: number, activeIndex: number) {
  return width * -activeIndex;
}

function scanState(state: State, input: StateInput) {
  state = { ...state };
  if (input.type === 'headerWidth') {
    state.headerWidth = input.headerWidth;
    return state;
  }
  if (input.type === 'hostWidth') {
    state.hostWidth = input.hostWidth;
    return state;
  }
  if (input.type === 'pan') {
    return processPan(state, input.pan);
  }
  if (input.type === 'requestedIndex') {
    return processRequestedIndexChange(state, input.requestedIndex);
  }
}

function updateStatePositionOnIndex(state: State): State {
  return {
    ...state,
    headerPosition: getPosition(state.headerWidth, state.activeIndex),
    tabPosition: getPosition(state.hostWidth, state.activeIndex)
  };
}

function processRequestedIndexChange(
  state: State,
  requestedIndex: number
): State {
  state.activeIndex = requestedIndex;
  state = updateStatePositionOnIndex(state);
  state.animating = true;
  return state;
}

function processPan(state: State, pan: Pan): State {
  if (state.hostWidth == null) {
    return state;
  }
  if (pan.isPanning) {
    state = updateStatePositionOnIndex(state);
    state.headerPosition += pan.position;
    state.tabPosition += pan.position;
    state.animating = false;
    return state;
  }
  const newIndex = getIndexFromPan(pan, state);
  state.activeIndex = newIndex;
  state = updateStatePositionOnIndex(state);
  state.animating = true;
  return state;
}

function getIndexFromPan(pan: Pan, state: State): number {
  const currentTabPosition = getPosition(state.hostWidth, state.activeIndex);
  const movement = Math.abs(currentTabPosition - pan.position);
  const movedTabs =
    (Math.abs(movement) + state.hostWidth / 2) / state.hostWidth;
  const direction = pan.position > 0 ? 'left' : 'right';
  const newTab =
    currentTabPosition + (direction === 'right' ? 1 : -1) * movedTabs;
  if (newTab >= state.tabCount) {
    return state.tabCount - 1;
  }
  if (newTab < 0) {
    return 0;
  }
  return newTab;
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
  readonly initState: State = { activeIndex: 0, tabCount: 3 };

  readonly state$ = merge(
    this.requestedIndex$.pipe(
      map(requestedIndex => ({
        type: 'requestedIndex' as const,
        requestedIndex
      }))
    ),
    this.hostWidth$.pipe(
      map(hostWidth => ({ type: 'hostWidth' as const, hostWidth }))
    ),
    this.headerWidth$.pipe(
      map(headerWidth => ({ type: 'headerWidth' as const, headerWidth }))
    ),
    this.panning$.pipe(
      debounceTime(0, animationFrameScheduler),
      map(pan => ({ type: 'pan' as const, pan }))
    )
  ).pipe(scan((state, input) => scanState(state, input), this.initState));

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
