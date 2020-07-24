import React from 'react';
import Button from '@material-ui/core/Button';
import { classMaker} from '../libs/utils';
import { makeStyles,createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme:Theme) => createStyles({
  button:{
    height:"6rem",
    width:"6rem",
    margin: "0 1rem 0 1rem",
    borderRadius:"3rem",

  },
}));


export type fireButtonProps = {
  children:string,
  onClick?: (e?:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void|undefined
}
const FireButton = ({children,onClick}:fireButtonProps) => {
  const classes = classMaker(useStyles());
  return (
    <Button  variant="contained" 
      color="primary" 
      {...classes('button')} 
      onClick={onClick}>
        {children}
    </Button>
  )
}

export {FireButton};
