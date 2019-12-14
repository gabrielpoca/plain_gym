/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export interface TimerProps {
  start: Date;
  end: Date;
}

export class Timer extends React.Component<TimerProps, {}> {
  private ref = React.createRef<HTMLDivElement>();
  private labelRef = React.createRef<HTMLDivElement>();
  private background2Ref = React.createRef<HTMLDivElement>();
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

    const seconds = (this.props.end.getTime() - new Date().getTime()) / 1000;

    if (seconds > -2) {
      const percentage = Math.floor(
        ((this.period - seconds) / this.period) * 100
      );

      if (percentage <= 101) {
        const value = Math.min(100 - percentage, 100);
        this.ref.current!.style.transform = `translateX(-${value}%)`;
      }
    }

    if (seconds < 0) {
      const percentage = Math.floor(
        ((300 - this.period - Math.abs(seconds)) / (300 - this.period)) * 100
      );

      if (percentage <= 101) {
        const value = Math.min(100 - percentage, 100);
        this.background2Ref.current!.style.transform = `translateX(-${value}%)`;
      }
    }

    if (Math.floor(this.period - seconds) !== 0) {
      const value = Math.floor(this.period - seconds);
      let secs = value;
      let mins = 0;

      while (secs > 60) {
        mins = 1;
        secs -= 60;
      }

      const minsFormat = mins ? `${mins}m` : '';
      this.labelRef.current!.innerHTML = `${minsFormat} ${secs}s`;
    } else this.labelRef.current!.innerHTML = ``;

    requestAnimationFrame(this.animate);
  };

  render() {
    return (
      <TimerBase
        backgroundRef={this.ref}
        labelRef={this.labelRef}
        background2Ref={this.background2Ref}
      />
    );
  }
}

const useStyles = makeStyles(theme => {
  return {
    root: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: fade(theme.palette.grey[900], 0.5),
      height: 50,
    },
    overlay: {
      transition: 'all 0.9s linear',
      background: theme.palette.secondary.light,
      width: '100%',
      transform: 'translateX(-100%)',
      height: '100%',
    },
    line: {
      transition: 'all 300s linear',
      background: theme.palette.secondary.dark,
      width: '100%',
      transform: 'translateX(-100%)',
      height: 4,
      position: 'absolute',
      top: 0,
      left: 0,
    },
  };
});

interface TimerBaseProps {
  backgroundRef: any;
  background2Ref: any;
  labelRef: any;
}

const TimerBase = ({
  backgroundRef,
  background2Ref,
  labelRef,
}: TimerBaseProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div ref={backgroundRef} className={classes.overlay} />
      <div ref={background2Ref} className={classes.line} />

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
