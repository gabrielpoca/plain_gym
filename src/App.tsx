/** @jsx jsx */
import { jsx, Global, css, keyframes } from "@emotion/core";
import * as _ from "lodash";
import React, { useReducer } from "react";

import settings from "./settings.json";
import { Timer } from "./components/Timer";

const selectedKeyframe = keyframes`
  from, 50%, to {
    opacity: 1;
  }

  25%, 74% {
   opacity: 0.2;
  }
`;

interface ReducerState {
  start: Date;
  end: Date;
  selected: string;
}

type ReducerAction = { type: "reset"; rest: number; id: string };

function reducer(state: ReducerState, action: ReducerAction) {
  switch (action.type) {
    case "reset":
      const start = new Date();
      const end = new Date();
      end.setSeconds(start.getSeconds() + action.rest);
      return { ...state, end, start, selected: action.id };
    default:
      throw new Error();
  }
}

const App: React.FC = () => {
  const [times, dispatch] = useReducer(reducer, {
    start: new Date(),
    end: new Date(),
    selected: ""
  });

  return (
    <div css={{ padding: 20 }}>
      <Global
        styles={css`
          *,
          *:before,
          *:after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          ul,
          ol {
            list-style: none;
          }
        `}
      />
      <ul>
        {settings.exercises.map(exercise => (
          <li
            key={exercise.id}
            css={{ border: "1px solid black", marginBottom: 20, padding: 10 }}
          >
            <h2 css={{ fontSize: 20, marginBottom: 10 }}>{exercise.title}</h2>
            <ol css={{ display: "flex", justifyContent: "flex-start" }}>
              {_.times(exercise.sets).map(time => {
                return (
                  <li
                    key={time}
                    css={{
                      animation:
                        times.selected === `${exercise.id}-${time}`
                          ? `${selectedKeyframe} 1s ease 1`
                          : "",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "red",
                      borderRadius: "50%",
                      width: 50,
                      marginRight: 20,
                      height: 50
                    }}
                  >
                    <button
                      onClick={() => {
                        dispatch({
                          type: "reset",
                          rest: exercise.rest,
                          id: `${exercise.id}-${time}`
                        });
                      }}
                      css={{
                        background: "none",
                        border: "none",
                        width: "100%",
                        fontSize: "inherit",
                        color: "inherit",
                        height: "100%"
                      }}
                    >
                      {time + 1}
                    </button>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ul>
      <button css={{ position: "fixed", bottom: 100, right: 20 }}>
        Finish Exercise
      </button>
      <Timer {...times} />
    </div>
  );
};

export default App;
