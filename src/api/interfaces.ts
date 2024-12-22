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


export type {CreateCampusGroupModel, EditCampusGroupModel, UserRoles, Group, UserLoginModel, UserRegisterModel, UserRegisterModel as DoctorRegisterModel, LoginApiResponse, ProfileApiInterface as ProfileApiResponse }