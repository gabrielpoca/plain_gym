/** @jsx jsx */
import { jsx } from "@emotion/core";
import React from "react";

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
    if (this.period === 0) return requestAnimationFrame(this.animate);
    const seconds = Math.abs(
      (this.props.end.getTime() - new Date().getTime()) / 1000
    );
    const percentage = Math.floor(
      ((this.period - seconds) / this.period) * 100
    );
    const value = Math.min(100 - percentage, 100);
    this.ref.current!.style.transform = `translateX(-${value}%)`;
    this.labelRef.current!.innerHTML = `${Math.floor(this.period - seconds)}`;
    requestAnimationFrame(this.animate);
  };

  render() {
    return (
      <div
        css={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "grey",
          height: 50
        }}
      >
        <div
          ref={this.ref}
          css={{
            transition: "all 0.9s linear",
            background: "red",
            width: "100%",
            transform: "translateX(-100%)",
            height: "100%"
          }}
        />

        <div
          ref={this.labelRef}
          css={{
            position: "fixed",
            left: 20,
            bottom: 0,
            color: "white",
            height: 50,
            display: "flex",
            alignItems: "center",
            fontSize: 20,
            width: 100
          }}
        />
      </div>
    );
  }
}
