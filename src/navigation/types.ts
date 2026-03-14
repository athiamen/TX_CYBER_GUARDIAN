export type RootTabParamList = {
  Modules: undefined;
  Auth: undefined;
  Profil: undefined;
};

export type QuizParams =
  | {
      quizId?: string;
      quizTitle?: string;
    }
  | undefined;

export type CourseDetailsParams = {
  courseCode: string;
  courseTitle?: string;
  moduleTitle?: string;
  autoStart?: boolean;
};

export type ModulesStackParamList = {
  ModulesHome: undefined;
  CourseDetails: CourseDetailsParams;
  QuizDetails: QuizParams;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ExportReport: undefined;
};