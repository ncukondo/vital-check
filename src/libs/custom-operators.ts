import {Observable,merge,Observer, EMPTY,interval} from 'rxjs';
import {map,debounce,filter} from 'rxjs/operators';


const cancelableDebounceTimer = <T,R>(delay:number,canceler:Observable<T>) =>
(input:Observable<R>) => Observable.create((observer:Observer<R>) =>{
  const newStream = merge(
      input.pipe(map(v=>({cancelSignal:false,value:v}))),
      canceler.pipe(map(_=>({cancelSignal:true,value:null})))
    ).pipe(
      debounce(value=>
        value.cancelSignal ? EMPTY : interval(delay)
      ),
      filter(value=>!value.cancelSignal),
      map(value=>value.value)
    ) as Observable<R>;
  newStream.subscribe({
    next(value) {observer.next(value);},
    error(err) {observer.error(err);},
    complete() {observer.complete();}
  })
})

export {cancelableDebounceTimer};