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

export interface SettingsExercise {
  id: string;
  title: string;
  sets: number;
  reps: number;
  equipment?: string;
  increment: boolean;
  rest: number;
}

export interface SettingsWorkout {
  variant: string;
  exercises: SettingsExercise[];
}

export interface Settings {
  workouts: SettingsWorkout[];
}
