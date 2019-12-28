import { RxDocument, RxCollection } from 'rxdb';

export interface WorkoutExercise {
  [set: number]: number;
}

interface WorkoutExercises {
  [exercises: string]: WorkoutExercise;
}

export interface WorkoutDocType {
  id: string;
  date: string;
  exercises: WorkoutExercises;
  settings: SettingsDocType;
  state: string;
  modelType: string;
}

export interface SettingsExercise {
  id: number;
  sets: number;
  exerciseId: number;
  multi: boolean;
  reps: number[];
}

export interface SettingsDocType {
  id: string;
  rest: number;
  exercises: SettingsExercise[];
}

export type Workout = RxDocument<WorkoutDocType, {}>;
export type Settings = RxDocument<SettingsDocType, {}>;

export type WorkoutCollectionMethods = {
  startWorkout: (settings: Settings) => Promise<Workout>;
};

export type WorkoutCollection = RxCollection<
  WorkoutDocType,
  {},
  WorkoutCollectionMethods
>;

export type SettingsCollection = RxCollection<SettingsDocType, {}, {}>;

export type WorkoutDatabaseCollections = {
  workouts: WorkoutCollection;
  settings: SettingsCollection;
};
