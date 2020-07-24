import {delay,  mapTo,filter, tap} from 'rxjs/operators'
import { of,concat, Observable,race,NEVER, Subject} from 'rxjs'

const formatDate = (date: Date) => {
  const year = date.getFullYear().toString().padStart(4, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const vibrate = (durations:number[]) =>
  typeof window.navigator.vibrate==="function" &&
  window.navigator.vibrate(durations);

const temporaryText = <T extends any>(text:string,duration:number,cancel?:Observable<T>) =>
  concat(
    of(""),
    of(text),
    race(
        of("").pipe(delay(duration)),
        (cancel ? cancel : NEVER).pipe(mapTo(text))
      ).pipe(
        filter(text=>text===""))
    )

type Signal<T> = T|[T,number];
const delaySignals = <T,U>(signals:Signal<T>[],cancel?:Observable<U>) =>
    concat(
      ...signals.map(signal=>{
        const [value,delayMilli] = Array.isArray(signal) ? [signal[0],signal[1]] : [signal,0];
        return !delayMilli
            ? of(value)
            : cancel
              ? race(
                  of(value).pipe(delay(delayMilli)),
                  cancel.pipe(mapTo(undefined))
                )
              :  of(value).pipe(delay(delayMilli))
      })
    ).pipe(
      filter(v=>v!==undefined)
    ) as Observable<T>
const delayCallbacks = <T extends Function,U>(signals:Signal<T>[],cancel?:Observable<U>) =>
    concat(
      ...signals.map(signal=>{
        const [value,delayMilli] = Array.isArray(signal) ? [signal[0],signal[1]] : [signal,0];
        return !delayMilli
            ? of(value)
            : cancel
              ? race(
                  of(value).pipe(delay(delayMilli)),
                  cancel.pipe(mapTo(undefined))
                )
              :  of(value).pipe(delay(delayMilli))
      }).filter(v=>v!==undefined)
    ).subscribe(fn=> typeof fn==="function" && fn());
  

const classMaker = <T extends {[key:string]:string},U extends keyof T>(classes:T) => 
  (...names:(U|null|undefined|false|"")[]) =>
    ({className: Object.entries(classes)
      .flatMap<string,string[]>(([key,value])=> names.includes(key as U)  ? [value]: [])
      .join(' ')})

const firstAndLast = <T>(array:T[]):[T|undefined,T|undefined] => {
  const [first,..._array] = [...array];
  return [first,_array.pop()];
}

const secondDelta = (date1: Date, date2: Date) => 
  Math.ceil((date2.getTime() - date1.getTime()) / 1000)

const milliSecondDelta = (date1: Date, date2: Date) => 
  date2.getTime() - date1.getTime()


const milliSecondsBetweenTimes = (times:Date[])=>{
  const [first,last] = firstAndLast(times);
  return first && last && milliSecondDelta(first,last);
}

const secondsBetweenTimes = (times:Date[])=>{
  const [first,last] = firstAndLast(times);
  return first && last && secondDelta(first,last);
}

const toCountPerMinute = (times:Date[]) => {
  const duration = secondsBetweenTimes(times);
  return duration ? Math.ceil((times.length-1)/(duration/60)) : 0;
}

const writable = <T>(value?:T)=>{
  const subject = new Subject<T>();
  let prev:T;
  if(value!==undefined) prev=value;
  const fire = (v:T|((prev?:T)=>T)) =>{
    const value:T = typeof v==="function" ? (v as (prev?:T)=>T)(prev) : v as T;
    subject.next(value);
    prev=value;
  }
  const get = ()=>prev;
  const data:Observable<T> = value!==undefined ?  subject.pipe(tap(v=>fire(value))) : subject;
  return [data,fire,get] as [Observable<T>,(value:T|((prev?:T)=>T))=>void,()=>T]
}; 

export {formatDate, vibrate, temporaryText,classMaker,delaySignals,delayCallbacks,
  firstAndLast,milliSecondsBetweenTimes,milliSecondDelta,secondDelta,secondsBetweenTimes
  ,toCountPerMinute,writable};