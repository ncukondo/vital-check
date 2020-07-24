import React, { useEffect } from 'react';
import {makeVitalStream} from '../libs/vital-stream';
import { makeStyles,createStyles, Theme } from '@material-ui/core/styles';
import {  vibrate,classMaker} from '../libs/utils';
import {useObservable} from 'rxjs-hooks';
import {ShowVitalInfo} from '../components/show-vital-info';
import {FireButton} from '../components/fire-button'
import {makeLayout} from '../components/layout'

const useStyles = makeStyles((theme:Theme) => createStyles({
  history:{
    transformOrigin: "top",
    transform: "scale(0.7,0.7)",
  },
}));

const {
  currentData,
  historyData,
  onSufficient,
  fire
} = makeVitalStream({vitalName:"PR",sufficientLimit:15000,autoCloseDelay:15000}) 

onSufficient.subscribe(v=>vibrate([400]));

const onFire = ()=>{
  vibrate([100]);
  fire();
}

const useSufficientVibration = ()=>{
  useEffect(()=>{
    const subscription = onSufficient.subscribe(v=>vibrate([400]));
    return () => subscription.unsubscribe();  
  },[])
}

function PulseCount(){
  const classes = classMaker(useStyles());
  const history = useObservable(()=>historyData);
  const info = useObservable(()=>currentData);
  useSufficientVibration();

  return makeLayout(
    <ShowVitalInfo {...{info}} />,
    <div {...classes('history')}>{
      history && history.map(
        info => <ShowVitalInfo {...{info,showStartTime:true,key:info.id}} />
      )
      }
    </div>,
    <FireButton onClick={()=>onFire()}>Tap on Pulse</FireButton>
  )
}

export {PulseCount} 