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
  maximumStudentCount: number,
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
  maximumStudentCount: number,
  semester: Semesters,
  requirments: string,
  annotations: string,
  mainTeacherId: string
}
export type { CreateCampusCourseModel, CampusCourseModel, CreateCampusGroupModel, EditCampusGroupModel, UserRoles, Group, UserLoginModel, UserRegisterModel, UserRegisterModel as DoctorRegisterModel, LoginApiResponse, ProfileApiInterface as ProfileApiResponse }