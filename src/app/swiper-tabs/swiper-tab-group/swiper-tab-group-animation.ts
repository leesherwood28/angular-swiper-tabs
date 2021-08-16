import { Observable, defer, animationFrameScheduler, interval, OperatorFunction } from 'rxjs';
import { map, pairwise, switchMap, takeWhile } from 'rxjs/operators';

export function elasticInOut(t: number) {
  return t < 0.5
    ? 0.5 *
        Math.sin(((+13.0 * Math.PI) / 2) * 2.0 * t) *
        Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
    : 0.5 *
        Math.sin(((-13.0 * Math.PI) / 2) * (2.0 * t - 1.0 + 1.0)) *
        Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) +
        1.0;
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

function distance(distance: number) {
  return (time: number) => distance * time; 
}

function tween(ms: number, easing: (a: number) => number): OperatorFunction<number, number> {
  return (source: Observable<number>) => source.pipe(
    pairwise(),
    switchMap(([p, n]) => 
      duration(ms).pipe(
        map(easing),
        map(distance(n - p)),
        map(addedDistance => n + addedDistance)
  )));
}
