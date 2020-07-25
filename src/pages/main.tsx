import React from 'react';
import { makeStyles,createStyles, Theme } from '@material-ui/core/styles';
import {  classMaker} from '../libs/utils';
import { BrowserRouter as Router, Route,useHistory } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import  {RespiratoryCount} from './respiratory-count';
import  {PulseCount} from './pulse-count';
import  {DualVitalCount} from './dual-vital-count';
import {localData} from '../libs/local-data';

const {getCurrent:getDefaultTab,set:setDefaultTab} = localData('defaultTab','/resp');

const useStyles = makeStyles((theme:Theme) => createStyles({
  container:{
    height:"100%",
    position:"relative",
  },
  tabs:{
    height:"48px"
  },
  body:{
    height:"calc(100% - 48px)"
  },
}));


type TabInfo = {[key:string]:string};
interface TabProps  {
  info:TabInfo;
  value?:string;
  onChange?: (newValue: string) => void; 
}

const toDefaultTab = (callback:(value:string)=>void) =>{
  getDefaultTab().then(tabName=>callback(tabName));
}

const AppTabs = (props:TabProps) => {
  const {value,info,onChange} = props;
  console.log(`tabvalue:${value}`);
  const history = useHistory();
  const path = history.location.pathname;
  if(!value && path==="/" && onChange) toDefaultTab(onChange);
  const handleChange = (newValue: string) => {
    history.push(newValue);
    setDefaultTab(newValue);
    onChange && onChange(newValue);
  };

  return (
    <Paper square>
      <Tabs
        value={value || path}
        indicatorColor="primary"
        textColor="primary"
        onChange={(e,value)=>handleChange(value)}
        centered
      >
      {Object.entries(info).map(([key,value]) =>
        <Tab label={key} value={value} key={value} />
      )}
      </Tabs>
    </Paper>
  );
}

type BodyProps ={
  defaultPath:string
}
const Body = (props:BodyProps)=>{
  const {defaultPath: defaultValue} = props;
  const classes = classMaker(useStyles());
  const defaultComp = (path:string)=>{
    switch(path){
      case '/resp': return RespiratoryCount
      case '/pulse': return PulseCount
      case '/both': return DualVitalCount
      default: return  RespiratoryCount;
    }
  }
  return (
    <div {...classes('body')}>
      <Route exact path='/' component={defaultComp(defaultValue)}/>
      <Route exact path='/resp' component={RespiratoryCount}/>
      <Route exact path='/pulse' component={PulseCount}/>
      <Route path='/both' component={DualVitalCount}/>
    </div>
  )
}

export default function Main() {
  const classes = classMaker(useStyles());

  const [value, setValue] = React.useState("");

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };
  const info ={
    Resp:'/resp',
    Pulse:'/pulse',
    Both:'/both'
  }

  return (
    <Router {...classes('container')}>
      <AppTabs  {...classes('tabs')} info={info} value={value} onChange={handleChange} />
      <Body defaultPath={value} />
    </Router>
  );
}