import React from 'react';
import { makeStyles,createStyles, Theme } from '@material-ui/core/styles';
import { classMaker} from '../libs/utils';

const useStyles = makeStyles((theme:Theme) => createStyles({
  container:{
    height:"100%",
    width:"100%",
    maxHeight:"100%",
    position:"relative",
    textAlign:"center",
  },
  header:{
    height:"10rem",
    width:"100%",
  },
  bodyouter:{
    height:"calc(100% - 17rem)",
    overflow:"hidden",
    width:"100%",
    position: "relative",
  },
  overlay:{
    position:"absolute",
    zIndex:1,
    left:0,
    width:"calc(100% - 10px)",
    pointerEvents:"none",
  },
  overlayTop:{
    height:"2rem",
    top:0,
    background:"linear-gradient(0deg, rgba(255,255,255,0), rgba(255,255,255,1))",
  },
  overlayBottom:{
    height:"2rem",
    bottom:0,
    background:"linear-gradient(0deg, rgba(255,255,255,1), rgba(255,255,255,0))",
  },
  bodyinner:{
    maxHeight:"100%",
    overflow:"auto",
    width:"100%",
    "&::-webkit-scrollbar":{
      width:"10px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0, 0, 50, .5)",
      borderRadius: "10px",
      minHeight: "16px",
      boxShadow:"none"
    },
    "&:hover::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0, 0, 50, .6)",
    },
  },
  footer:{
    position: "absolute",
    bottom:"0",
    height:"7rem",
    width:"100%",
  },
}));

const range = (len:number, start=0 ) => [...Array(len)].map((_, i) => start + i);

const makeLayout = (header:JSX.Element,body:JSX.Element|null|false|undefined,footer:JSX.Element) =>
  (() =>{
    const classes = classMaker(useStyles());
    return (
      <section {...classes('container')}>
        <header {...classes('header')}>{header}</header>
        <section {...classes('bodyouter')}>
          <div {...classes('overlay','overlayTop')}></div>
          <div {...classes('overlayBottom','overlay')}></div>
          <section {...classes('bodyinner')}>
            {body}
          </section>
        </section>
        <footer {...classes('footer')}>{footer}</footer>
      </section>
    )
  })();

const Layout = () => 
  makeLayout(
    <div>header</div>,
    <div>{range(50).map(v=><div>{v}</div>)}</div>,
    <div>fotter</div>
  )

export {Layout,makeLayout}