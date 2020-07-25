import React, { useEffect } from 'react';
import { makeStyles,createStyles, Theme } from '@material-ui/core/styles';
import {  vibrate, classMaker} from '../libs/utils';
import {useObservable} from 'rxjs-hooks';
import {ShowVitalInfos} from '../components/show-vital-info';
import {makeLayout} from '../components/layout'
import {FireButton} from '../components/fire-button'
import { makeDualVitalStream } from '../libs/dual-vital-stream';

const useStyles = makeStyles((theme:Theme) => createStyles({
  history:{
    transformOrigin: "top",
    transform: "scale(0.7,0.7)",
  },
}));

const {
  historyData,
  fireRespiration,
  firePulse,
  currentData,
  onRespSufficient,
  onPulseSufficient,
  reset,
} = makeDualVitalStream();



const onRespiration = ()=>{
  vibrate([100,100,100]);
  fireRespiration();
}

const onPulse = ()=>{
  vibrate([100]);
  firePulse();
}

const useSufficientVibration = () =>{
  useEffect(()=>{
    const unsubscribeResp = onRespSufficient.subscribe(()=>vibrate([400]) );
    const unsubscribePulse = onPulseSufficient.subscribe(()=>vibrate([400]) );
    return ()=>{
      unsubscribeResp.unsubscribe();
      unsubscribePulse.unsubscribe();
    }
    
  },[])
}

const useOnDestroy = () =>{
  useEffect(()=>{
    return ()=>{
      reset();
    }
  },[])
}


function DualVitalCount(){
  const classes = classMaker(useStyles());
  const vitals = useObservable(()=>currentData);
  const history = useObservable(()=>historyData);
  useSufficientVibration();
  useOnDestroy();

  return makeLayout(
    <div>
      <ShowVitalInfos {...{items:vitals}} />
    </div>,
    <div {...classes('history')}>{
      history && history.map(
        (items,i) => <ShowVitalInfos {...{items,key:i}} />
      )
      }
    </div>,
    <div>
      <FireButton onClick={()=>onRespiration()}>Tap on Inhale</FireButton>
      <FireButton onClick={()=>onPulse()}>Tap on Pulse</FireButton>
    </div>
)
}

export {DualVitalCount} 