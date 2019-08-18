import { RxDocument, RxCollection } from 'rxdb';

interface WorkoutExercise {
  [set: number]: number;
}

interface WorkoutExercises {
  [exercises: string]: WorkoutExercise;
}

export interface WorkoutDocType {
  id: string;
  variant: string;
  date: string;
  state: string;
  exercises: WorkoutExercises;
  modelType: string;
}

export type Workout = RxDocument<WorkoutDocType, {}>;

export type WorkoutCollectionMethods = {
  startWorkout: (settings: Settings) => Promise<Workout>;
};

export type WorkoutCollection = RxCollection<
  WorkoutDocType,
  {},
  WorkoutCollectionMethods
>;

export interface SettingsExercise {
  id: string;
  sets: number;
  reps: number;
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
