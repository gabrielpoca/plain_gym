interface WorkoutExercise {
  [set: number]: number;
}

interface WorkoutExercises {
  [exercises: string]: WorkoutExercise;
}

export interface Workout {
  id: string;
  variant: string;
  date: Date;
  state: string;
  exercises: WorkoutExercises;
}

export interface Exercise {
  id: string;
  title: string;
  sets: number;
  reps: number;
  equipment?: string;
  increment: boolean;
  rest: number;
}

export interface Settings {
  exercises: Exercise[];
}
