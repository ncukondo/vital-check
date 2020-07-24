import {Observable,merge, } from 'rxjs';
import {map,distinctUntilChanged,scan,filter,shareReplay, share, pairwise, startWith} from 'rxjs/operators';
import {cancelableDebounceTimer} from './custom-operators';
import { firstAndLast, milliSecondsBetweenTimes, secondsBetweenTimes, toCountPerMinute, writable } from './utils';

interface vitalStreamOption {
  autoCloseDelay?:number;
  sufficientLimit?:number;
  vitalName?:string,
}

const vitalStreamOptionDefault ={
  autoCloseDelay:30000,
  sufficientLimit:30000,
  vitalName:"RR",
}

type TimingInfo = (Date|number);

type ClosedSignal = 0;
const closedSignal:ClosedSignal = 0;

type NextSignal = 1;
const nextSignal:NextSignal = 1;

type ResetSignal = 2;
const resetSignal:ResetSignal = 2;

type Signal = ResetSignal|ClosedSignal|NextSignal; 


export interface VitalInfo {
  duration: number;
  count: number;
  countPerMinute: number;
  sufficientLimit: number;
  id: number;
  vitalName: string;
  startTime: Date | undefined;
  lastUpdate: Date | undefined;
  isSufficient: boolean;
  isValid: boolean;
  isClosed: boolean;
  raw: TimingInfo[];
}

  
const closed = (infos:TimingInfo[]) => 
  [...infos].reverse().some(info => info === closedSignal)

let tempId = 0;
const toVitalInfo = (infos:TimingInfo[],vitalName="",sufficientLimit=30000):VitalInfo => {
  const times = infos.filter(info => typeof info !== "number") as Date[];
  return {
    duration: secondsBetweenTimes(times) ?? 0,
    sufficientLimit,
    isSufficient: (milliSecondsBetweenTimes(times) ?? 0)>= sufficientLimit,
    id: firstAndLast(times)[0]?.getTime() ?? tempId++,
    isValid: times.length>1,
    isClosed: closed(infos),
    vitalName,
    count: times.length-1,
    countPerMinute: toCountPerMinute(times) ?? 0,
    startTime: firstAndLast(times)[0],
    lastUpdate: [...times].reverse()[0],
    raw: infos.map(info => typeof info === "number" ? info : new Date(info.getTime()))
  }
};

const close = (info:VitalInfo) =>
  closed(info.raw) 
    ? info
    : toVitalInfo([...info.raw,closedSignal],info.vitalName,info.sufficientLimit);

const makeVitalStream= (option?:vitalStreamOption)=>{
  const opt = {...vitalStreamOptionDefault,...option};
  const _toDisplayInfo = (infos:TimingInfo[]) =>
    toVitalInfo(infos,opt.vitalName,opt.sufficientLimit);
  
  const empty = ()=>_toDisplayInfo([]);
    

  const [vitalStream,fireVitalStream] =  writable<Date>();
  const fire = ()=>fireVitalStream(new Date());  
  const [onBeforeNext,fireOnBeforeNext] = writable<VitalInfo>();

  const proccessNextSignal = (list:TimingInfo[]):TimingInfo[] =>{
    console.log(`next signal ${list}`);
    if(!closed(list)) _close();
    return [];
  }

  const proccessResetSignal = ():TimingInfo[] => {
    return []
  };

  const proccessCloseSignal = (prev:TimingInfo[]):TimingInfo[] => [...prev,closedSignal];

  const proccessAddSignal = (prevList:TimingInfo[],next:Date):TimingInfo[] => {
    if(closed(prevList)){ 
      fireOnBeforeNext(_toDisplayInfo(prevList));
    }
    return closed(prevList) ? [next] : [...prevList,next];
  }

  const proccessInfo = (list:TimingInfo[],item:TimingInfo):TimingInfo[] =>{
    console.log(`${opt.vitalName}->> ${item}`)
    switch (item) {
      case nextSignal: return proccessNextSignal(list);
      case resetSignal: return proccessResetSignal();
      case closedSignal: return proccessCloseSignal(list);
      default: return proccessAddSignal(list,item as Date);
    }
  }

  const [signalStream,fireSignal] = writable<Signal>();
  const switchToNext = ()=> fireSignal(nextSignal);
  const _close = ()=> fireSignal(closedSignal);
  const reset = ()=> fireSignal(resetSignal);

  const rawData =  
    merge(
      vitalStream,
      signalStream,
    ).pipe(
      distinctUntilChanged(),
      scan(proccessInfo ,[]),
      share(),
    ) as Observable<TimingInfo[]>;
  
  const currentData = rawData.pipe(
      map((infos:TimingInfo[]) => _toDisplayInfo(infos)),
      shareReplay(1)
      ) as Observable<VitalInfo>;

  const onClose = currentData.pipe(filter(item=>item.isClosed));
  const onNext = rawData.pipe(
      pairwise(),
      filter(([prev,next])=>closed(prev) && next.length>0),
      map(([prev,next])=> [_toDisplayInfo(prev),_toDisplayInfo(next)]),

    )
  const onAdd = currentData.pipe(filter(item=>item.count>=0))
  const isSufficient = onAdd.pipe(
    map(item=>item.isSufficient),
    startWith(false),
    distinctUntilChanged(),
    )
  const onSufficient = isSufficient.pipe(
    filter(v=>v!==false),
  );

  const historyData = onNext.pipe(
    map(([prev])=>prev),
    filter((prev)=>prev.isValid),
    scan<VitalInfo,VitalInfo[]>((list,data)=> list.length>0 ? [data,...list]:[data],[]),
    shareReplay(1)
  ) as Observable<VitalInfo[]>;

  const currentlyCounting = ()=>rawData.pipe(
    map(infos=>infos.length>0 && !closed(infos))
  ) as Observable<boolean>;

  const autoClose = (delay=60000) => rawData.pipe(
    filter(item=>item.length>0),
    cancelableDebounceTimer(delay,onNext),
  ).subscribe(_=>_close());

  if (opt.autoCloseDelay) autoClose(opt.autoCloseDelay);

  return {
    currentData,
    rawData,
    currentlyCounting,
    historyData,
    onBeforeNext,
    fire,
    empty,
    reset,
    close: _close,
    autoClose,
    onNext,
    onClose,
    onAdd,
    isSufficient,
    onSufficient,
    switchToNext,
  }

}

export {makeVitalStream,toVitalInfo,toCountPerMinute, close}






