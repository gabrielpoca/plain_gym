/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export interface TimerProps {
  start: Date;
  end: Date;
}

export class Timer extends React.Component<TimerProps, {}> {
  private ref = React.createRef<HTMLDivElement>();
  private labelRef = React.createRef<HTMLDivElement>();
  private period = 0;

  componentDidMount() {
    this.updatePeriod(this.props.start, this.props.end);
    requestAnimationFrame(this.animate);
  }

  componentWillReceiveProps(props: TimerProps) {
    this.updatePeriod(props.start, props.end);
  }

  shouldComponentUpdate() {
    return false;
  }

  updatePeriod = (start: Date, end: Date) => {
    this.period = Math.floor(
      Math.abs((end.getTime() - start.getTime()) / 1000)
    );
    this.ref.current!.style.transition = `all ${this.period / 100}s linear`;
  };

  animate = () => {
    if (!this.ref || !this.ref.current) return;
    if (this.period === 0) return requestAnimationFrame(this.animate);
    const seconds = Math.abs(
      (this.props.end.getTime() - new Date().getTime()) / 1000
    );
    const percentage = Math.floor(
      ((this.period - seconds) / this.period) * 100
    );
    const value = Math.min(100 - percentage, 100);
    this.ref.current!.style.transform = `translateX(-${value}%)`;

    if (Math.floor(this.period - seconds) !== 0)
      this.labelRef.current!.innerHTML = `${Math.floor(
        this.period - seconds
      )}s`;
    else this.labelRef.current!.innerHTML = ``;

    requestAnimationFrame(this.animate);
  };

  render() {
    return <TimerBase backgroundRef={this.ref} labelRef={this.labelRef} />;
  }
}

const useStyles = makeStyles(theme => {
  return {
    root: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: theme.palette.grey.A100,
      height: 50,
    },
    overlay: {
      transition: 'all 0.9s linear',
      background: theme.palette.secondary.main,
      width: '100%',
      transform: 'translateX(-100%)',
      height: '100%',
    },
  };
});

interface TimerBaseProps {
  backgroundRef: any;
  labelRef: any;
}

const TimerBase = ({ backgroundRef, labelRef }: TimerBaseProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div ref={backgroundRef} className={classes.overlay} />

      <Typography
        variant="h6"
        ref={labelRef}
        style={{
          position: 'fixed',
          left: 20,
          bottom: 0,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          width: 100,
        }}
      />
    </div>
  );
};
