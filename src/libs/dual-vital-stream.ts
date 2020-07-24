import {makeVitalStream, VitalInfo,close} from '../libs/vital-stream';
import {map,startWith, filter, scan, withLatestFrom, mapTo} from 'rxjs/operators'
import { combineLatest, Observable, merge } from 'rxjs';


const makeDualVitalStream = ()=>{

  const {
    currentData: respData,
    onNext:onRespNext,
    onBeforeNext:onRespBeforeNext,
    reset:respReset,
    empty:emptyResp,
    onSufficient:onRespSufficient,
    fire:fireRespiration
  } = makeVitalStream({vitalName:"RR",sufficientLimit:30000,autoCloseDelay:30000}) 

  const {
    currentData: pulseData,
    onNext:onPulseNext,
    onBeforeNext:onPulseBeforeNext,
    reset:pulseReset,
    empty:emptyPulse,
    onSufficient:onPulseSufficient,
    fire:firePulse
  } = makeVitalStream({vitalName:"PR",sufficientLimit:15000,autoCloseDelay:15000}) 

  onRespNext.subscribe(()=>pulseReset())
  onPulseNext.subscribe(()=>respReset())

  const currentData:Observable<(VitalInfo)[]> = 
    combineLatest(
      respData.pipe(startWith(emptyResp())),
      pulseData.pipe(startWith(emptyPulse())),
      (resp,pulse)=>[resp,pulse]);

  const historyData =
    merge(
      onRespBeforeNext.pipe(mapTo(0)),
      onPulseBeforeNext.pipe(mapTo(1))
    ).pipe(
      withLatestFrom(
        currentData,
        (index,[resp,pulse])=>[[resp,pulse],index] as [VitalInfo[],number]
        ),
      filter(([[resp,pulse]])=> resp.isValid || pulse.isValid),
      map(([infos,index])=> infos.map((info,i)=> i!==index ? close(info): info)),
      scan((list,current)=>[current,...list],[] as VitalInfo[][])
    )

  return {
    historyData,
    fireRespiration,
    firePulse,
    currentData,
    onRespSufficient,
    onPulseSufficient
  }

}

export {makeDualVitalStream}
