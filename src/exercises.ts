const allExercises = [
  'Bench with Dumbells',
  'Incline Bench with Dumbells',
  'Lat Pulldowns',
  'Bent Over Rows',
  'Curls',
  'Reverse Flies',
  'Squats',
  'Weighted Back Extensions',
  'Leg Press',
  'Leg Curls',
  'Ab work',
  'Calf raises',
  'Overhead Press',
  'Flies',
  'Pullups',
  'Pendlay Rows',
  'Face Pulls',
  'Tricep Pressdowns',
  'Front Squat',
  'Romanian Deadlift',
  'Leg Extensions',
  'Leg Curls',
];

interface Exercises {
  [id: string]: string;
}

function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

export const exercises = allExercises.reduce(
  (memo: Exercises, title: string) => {
    memo[camelize(title)] = title;
    return memo;
  },
  {} as Exercises
);
