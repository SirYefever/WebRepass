interface LoginApiResponse {
  token?: string;
}

interface ProfileApiInterface {
    fullName: string;
    birthDate: string;
    email: string
}

interface UserRegisterModel {
  fullName: string,
  birthDate: string,
  email: string,
  password: string,
  confirmPassword: string,
}

interface UserLoginModel {
  email: string,
  password: string
}

interface Group {
  id: string,
  name: string
}

interface UserRoles {
  isTeacher: boolean,
  isStudent: boolean,
  isAdmin: boolean,
}

interface EditCampusGroupModel{
  name: string
}

interface CreateCampusGroupModel{
  name: string
}

interface CampusCourseModel{
  id: string,
  name: string,
  startYear: number,
  maximumStudentsCount: number,
  remainingSlotsCount: number,
  status: CourseStatuses,
  semester: Semesters
}

export enum CourseStatuses{
  Created,
  OpenForAssigning,
  Started,
  Finished
}

export enum Semesters{
  Autumn,
  Spring
}

interface CreateCampusCourseModel{
  name: string,
  startYear: number,
  maximumStudentsCount: number,
  semester: string,
  requirements: string,
  annotations: string,
  mainTeacherId: string
}

interface UserModel{
  id: string,
  fullName: string
}

interface StudentDataModel{
  id: string,
  name: string,
  email: string,
  status: string,
  midtermResult: string,
  finalResult: string
}

interface CourseTeacherModel{
  name: string,
  email: string,
  isMain: boolean
}

interface CourseInfoModel{
  id: string,
  name: string,
  startYear: number,
  maximumStudentsCount: number,
  studentsEnrolledCount: number,
  studentsInQueueCount: number,
  semester: string,
  requirements: string,
  annotations: string,
  status: string,
  students: StudentDataModel[],
  teachers: CourseTeacherModel[];
}

export enum StudentStatuses{
  InQueue,
  Accepted,
  Declined
}

export enum EditCourseStudentStatusModel{
  InQueue,
  Accepted,
  Declined
}

interface EditCourseStatusModel{
  status: CourseStatuses;
}

export enum MarkType{
  Midterm,
  Final
}

export enum Mark{
  NotDefined,
  Passed,
  Failed
}

interface EditCourseStudentMarkModel{
  markType: string,
  mark: string
}

interface EditCampusCourseRequirementsAndAnnotationsModel{
  requirements: string,
  annotations: string
}

interface EditCampusCourseModel{
  name: string,
  startYear: number,
  maximumStudentsCount: number,
  semester: string,
  requirements: string,
  annotations: string,
  mainTeacherId: string
}

interface UserInfoModel{
  fullname: string,
  email: string,
  birthDate: string,
}

export type { UserInfoModel, EditCampusCourseModel, CourseTeacherModel, EditCampusCourseRequirementsAndAnnotationsModel, EditCourseStudentMarkModel, EditCourseStatusModel, StudentDataModel, CourseInfoModel, UserModel, CreateCampusCourseModel, CampusCourseModel, CreateCampusGroupModel, EditCampusGroupModel, UserRoles, Group, UserLoginModel, UserRegisterModel, UserRegisterModel as DoctorRegisterModel, LoginApiResponse, ProfileApiInterface as ProfileApiResponse }