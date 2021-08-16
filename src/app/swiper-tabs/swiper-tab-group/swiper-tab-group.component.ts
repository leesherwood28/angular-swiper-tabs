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
  animationFrameScheduler,
  of
} from 'rxjs';
import {
  debounceTime,
  map,
  mergeMap,
  pairwise,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators';
import { SwiperTabHeaderComponent } from '../swiper-tab-header/swiper-tab-header.component';
import { SwiperTabComponent } from '../swiper-tab/swiper-tab.component';
import { cubicInOut, elasticInOut, tween } from './swiper-tab-group-animation';

export interface Pan {
  position: number;
  velocity: number;
  isPanning: boolean;
}

export type StateInput =
  | { type: 'pan'; pan: Pan }
  | { type: 'tabWidth'; tabWidth: number }
  | { type: 'requestedIndex'; requestedIndex: number };

export interface State {
  activeIndex: number;
  tabCount: number;
  position?: number;
  tabWidth?: number;
  animating?: boolean;
}
function scanState(state: State, input: StateInput) {
  state = { ...state };
  if (input.type === 'tabWidth') {
    state.tabWidth = input.tabWidth;
    return state;
  }
  if (input.type === 'pan') {
    return processPan(state, input.pan);
  }
  if (input.type === 'requestedIndex') {
    return processRequestedIndexChange(state, input.requestedIndex);
  }
}

function setStatePositionToIndex(state: State): State {
  return {
    ...state,
    position: state.activeIndex
  };
}

function processRequestedIndexChange(
  state: State,
  requestedIndex: number
): State {
  state.activeIndex = requestedIndex;
  state = setStatePositionToIndex(state);
  state.animating = true;
  return state;
}

function processPan(state: State, pan: Pan): State {
  if (state.tabWidth == null) {
    return state;
  }
  if (pan.isPanning) {
    state = setStatePositionToIndex(state);
    state.position += -pan.position / state.tabWidth;
    state.animating = false;
    return state;
  }
  const newIndex = getIndexFromPan(pan, state);
  state.activeIndex = newIndex;
  state = setStatePositionToIndex(state);
  state.animating = true;
  return state;
}

function getIndexFromPan(pan: Pan, state: State): number {
  const movedTabs = Math.floor(
    (Math.abs(pan.position) + state.tabWidth / 2) / state.tabWidth
  );
  const direction = pan.position > 0 ? 'left' : 'right';
  const newTab =
    state.activeIndex + (direction === 'right' ? 1 : -1) * movedTabs;

  if (newTab >= state.tabCount) {
    return state.tabCount - 1;
  }
  if (newTab < 0) {
    return 0;
  }
  return newTab;
}

function animatedTabPosition(): OperatorFunction<State, number> {
  return (source: Observable<State>) =>
    source.pipe(
      startWith(null),
      pairwise(),
      switchMap(([p, n]) => {
        if (n.animating && p !== null) {
          return of(p.position, n.position).pipe(tween(200, cubicInOut));
        } else {
          return of(n.position);
        }
      })
    );
}

@Component({
  selector: 'app-swiper-tab-group',
  templateUrl: './swiper-tab-group.component.html',
  styleUrls: ['./swiper-tab-group.component.css']
})
export class SwiperTabGroupComponent implements OnInit {
  // Input observables
  readonly requestedIndex$ = new Subject<number>();
  readonly tabWidth$ = new Subject<number>();
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
    this.tabWidth$.pipe(
      map(tabWidth => ({ type: 'tabWidth' as const, tabWidth }))
    ),
    this.panning$.pipe(
      debounceTime(0, animationFrameScheduler),
      map(pan => ({ type: 'pan' as const, pan }))
    )
  ).pipe(scan((state, input) => scanState(state, input), this.initState));

  // Outputs

  readonly translateX$ = this.state$.pipe(
    animatedTabPosition(),
    debounceTime(0, animationFrameScheduler),
    shareReplay(1)
  );

  readonly headerTranslateX$ = combineLatest([
    this.translateX$,
    this.state$
  ]).pipe(
    map(([position, state]) => {
      if (position > state.tabCount - 1) {
        return state.tabCount - 1;
      }
      if (position <= 0) {
        return 0;
      }
      return position;
    })
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
    this.populateTabWidth();
  }

  private populateTabWidth() {
    const boundingRect = this.host.nativeElement.getBoundingClientRect();
    this.tabWidth$.next(boundingRect.width);
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
  }
}
