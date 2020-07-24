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
  onChange?: (event: React.ChangeEvent<{}>, newValue: string) => void; 
}

const AppTabs = (props:TabProps) => {
  const {value,info,onChange} = props;
  const history = useHistory();
  const path = history.location.pathname;
  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    history.push(newValue);
    onChange && onChange(event,newValue);
  };

  return (
    <Paper square>
      <Tabs
        value={value || path}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        centered
      >
      {Object.entries(info).map(([key,value]) =>
        <Tab label={key} value={value} key={value} />
      )}
      </Tabs>
    </Paper>
  );
}


const Body = ()=>{
  const classes = classMaker(useStyles());
  return (
    <div {...classes('body')}>
      <Route exact path='/' component={RespiratoryCount}/>
      <Route exact path='/resp' component={RespiratoryCount}/>
      <Route exact path='/pulse' component={PulseCount}/>
      <Route path='/both' component={DualVitalCount}/>
    </div>
  )
}

export default function Main() {
  const classes = classMaker(useStyles());

  const [value, setValue] = React.useState("");

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
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
      <Body />
    </Router>
  );
}