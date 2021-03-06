import {
  Observable,
  defer,
  animationFrameScheduler,
  interval,
  OperatorFunction
} from 'rxjs';
import { map, pairwise, switchMap, takeWhile, tap } from 'rxjs/operators';

export function cubicInOut(t: number): number {
  return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
}

function duration(ms: number) {
  return msElapsed().pipe(
    map(ems => ems / ms),
    takeWhile(t => t <= 1)
  );
}

function msElapsed() {
  return defer(() => {
    const start = animationFrameScheduler.now();
    return interval(0, animationFrameScheduler).pipe(
      map(() => animationFrameScheduler.now() - start)
    );
  });
}

function distance(distance: number): (a: number) => number {
  return (time: number) => distance * time;
}

export function tween(
  ms: number,
  easing: (a: number) => number
): OperatorFunction<number, number> {
  return (source: Observable<number>) =>
    source.pipe(
      pairwise(),
      switchMap(([p, n]) =>
        duration(ms).pipe(
          map(easing),
          map(distance(n - p)),
          map(addedDistance => p + addedDistance)
        )
      )
    );
}
