interface LoginApiResponse {
  token?: string;
}

interface ProfileApiInterface {
    fullName: string;
    birthDate: string;
}

interface UserRegisterModel {
  fullName?: string,
  birthDate?: string,
  email?: string,
  password?: string,
  confirmPassword?: string,
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

enum CourseStatuses{
  Created,
  OpenForAssigning,
  Started,
  Finished
}

enum Semesters{
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

export type { UserModel, Semesters, CreateCampusCourseModel, CampusCourseModel, CreateCampusGroupModel, EditCampusGroupModel, UserRoles, Group, UserLoginModel, UserRegisterModel, UserRegisterModel as DoctorRegisterModel, LoginApiResponse, ProfileApiInterface as ProfileApiResponse }