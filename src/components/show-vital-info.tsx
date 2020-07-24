import React, { useRef, useEffect } from 'react';
import {VitalInfo} from '../libs/vital-stream';
import { makeStyles,createStyles, Theme } from '@material-ui/core/styles';
import { formatDate,classMaker} from '../libs/utils';

const useStyles = makeStyles((theme:Theme) => createStyles({
  vitalContainer:{
    display:"flex",
    justifyContent:"center"
  },
  vitalBox:{
    fontSize:"1rem",
    minWidth:"12rem",
    color:theme.palette.primary.main,
    textAlign:"center",
    position:"relative",
    overflow:"hidden"
  },
  mainRR:{
    position:"relative",
    fontSize:"5rem",
  },
  preliminaryValue:{
    color:`${theme.palette.grey[700]}`,
  },
  "@keyframes Ripple": { 
    "to": { 
      opacity: 0, 
      transform: "scale(2.0)" 
    } 
  },
  rippleActive: { 
    position: "absolute", 
    pointerEvents: "none", 
    background: theme.palette.primary.main, 
    borderRadius: "50%", 
    transform: "scale(0)", 
    animation: "$Ripple .8s", 
    opacity: ".3", 
  },
  
  "@keyframes Flash": {
    "0%":{
      textShadow: "0 0 1rem"
    },
    "30%":{
      textShadow: "0 0 2rem"
    },
    "100%":{
      textShadow: "0 0 1rem"
    }
  },
  blinkText:{
    textShadow: "0 0 1rem",
    animation: "$Flash 2s infinite ease",
    transition: "all 1s ease"
  },
}));

export type ShowVitalInfoProps = {
  info?:VitalInfo|null,
}
export type ShowVitalInfosProps = {items:(VitalInfo|null)[]|null};

const rippleEffect = (activeClassName:string,target?:HTMLElement|null) => { 
  if (!target) return; 

  const cover = document.createElement('span'); 
  const coverSize = target.offsetWidth; 
  const loc = target.getBoundingClientRect(); 

  const x = loc.width / 2 - coverSize/2; 
  const y =  loc.height / 2- coverSize/2; 

  const pos = `top: ${y}px; left: ${x}px; height: ${coverSize}px; width: ${coverSize}px;`; 

  target.appendChild(cover); 
  cover.setAttribute('style', pos); 
  cover.setAttribute('class', activeClassName); 

  setTimeout(() => { 
    cover.remove(); 
  }, 2000); 
}; 


const ShowVitalInfo = (props:ShowVitalInfoProps) => {
  const {info} = {...props};
  const classNames = useStyles();
  const classes = classMaker(classNames);
  const isClosed = info?.isClosed ?? true;
  const elm = useRef(null);
  const currentlyCounting = (info?.count ?? -1) >= 0 && !isClosed;
  useEffect(()=> {
    if(info && !info.isClosed) rippleEffect(classNames.rippleActive, elm.current)
  },[info,elm,classNames.rippleActive]);

  return (info && !(info.isClosed && !info.isValid) &&
      <div {...classes('vitalBox',!info.isSufficient && 'preliminaryValue')} >
      {info.isValid && info.vitalName}
      <span {...classes("mainRR",currentlyCounting && 'blinkText')} ref={elm}> 
        <span>
          {info?.isValid 
            ? info.countPerMinute 
            : currentlyCounting 
              ? info.vitalName
              : ""}
        </span>
      </span>
      {(currentlyCounting && !info.count) && <div>Started</div>}
      {info.isValid && <span>/min<div>{info.count}/{info.duration}sec</div></span>}
      {info.isClosed && info.startTime && <div>{formatDate(info.startTime)}</div>}
    </div>
      )   ||null    
    
    

}

const ShowVitalInfos:React.FC<ShowVitalInfosProps> = (props?:ShowVitalInfosProps) => {
  const classes = classMaker(useStyles());
  const filterFunc = (info:VitalInfo|null) =>{
    if(!info) return false;
    const currentlyCounting = info.count >= 0 && !info.isClosed;
    return currentlyCounting || info.isValid;
  }
  return (
    <div {...classes("vitalContainer")}>
      {props?.items
        ?.filter(filterFunc)
        ?.map((info,i)=> <ShowVitalInfo {...{info}} key={info?.id || i }/>)}
    </div>)
}


export {ShowVitalInfo,ShowVitalInfos}