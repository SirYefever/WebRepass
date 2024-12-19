interface LoginApiResponse {
  token?: string;
}

interface ProfileApiInterface {
    name?: string;
    birthday?: string;
    gender?: string;
    email?: string;
    phone?: string;
}

interface PatientsGetApiInterface {
    name?: string;
    sorting?: string;
    deathFilter?: boolean;
    recoveryFilter?: boolean;
    deseaseFilter?: boolean;
    // conclusions: string[];
    scheduledVisits?: boolean;
    onlyMine?: boolean;
    size?: number;
    page?: number;
}

interface Patient {
  name?: string;
  birthday?: string;
  gender?: string;
  id?: string;
  createTime?: string;
}

interface Pagination {
  size?: number;
  count?: number;
  current?: number;
}

interface PatientPagedListModel {
  patients: Patient[];
  pagination: Pagination;
}

interface PatientCreateModel {
  name?: string;
  birthday?: string;
  gender?: string;
}

interface PatientModel {
  id?: string;
  createTime?: string;
  name?: string;
  birthday?: string;
  gender?: string;
}

interface Icd10RecordModel {
  id?: string
  createTime?: string
  code?: string
  name?: string
}

enum ConclusionEnum {
  Death = "Death",
  Recovery = "Recovery",
  Disease = "Disease"
}

interface Conclusion {
  value:  ConclusionEnum;
}

enum GenderEnum {
  Male = "Male",
  Female = "Female"
}

interface Gender {
  value: GenderEnum  
}

enum DiagnosisTypeEnum {
  Main = "Main",
  Concomitant = "Concomitant",
  Complication = "Complication"
}

interface DiagnosisType {
  value: DiagnosisTypeEnum
}

interface DiagnosisModel {
  id?: string,
  createTime?: string,
  code?: string,
  name?: string,
  description?: string,
  type?: DiagnosisType,
}

interface DoctorModel {
  id?: string,
  createTime?: string,
  name?: string,
  birthday?: string,
  gender?: Gender,
  email?: string,
  phone?: string,
}

interface DoctorRegisterModel {
  name?: string,
  password?: string,
  speciality?: string,
  birthday?: string,
  gender?: GenderEnum,
  email?: string,
  phone?: string,
}

interface SpecialityModel {
  id?: string,
  createTime?: string,
  name?: string
}

interface InspectationCommentModel {
  id?: string,
  createTime?: string,
  parentId?: string,
  content?: string,
  author?: DoctorModel,
  modifyTime?: string,
}

interface InspectionConsultationModel {
  id?: string,
  createTime?: string,
  inspectionId?: string,
  speciality?: SpecialityModel,
  rootComment?: InspectationCommentModel,
  commentsNumber?: number,
}

interface InspectionModel {
  id?: string,
  createTime?: string,
  date?: string,
  anamnesis?: string,
  complaints?: string,
  treatment?: string,
  conclusion?: Conclusion,
  nextVisitDate?: string,
  deathDate?: string,
  baseInspectionId?: string,
  previousInspectionId?: string,
  patient?: PatientModel,
  doctor?: DoctorModel,
  diagnoses?: DiagnosisModel[],
  consultations?: InspectionConsultationModel[]
}

interface PatientInspectionResponse {
  inspections: InspectionModel[];
  pagination: Pagination;
}

interface SpecialityGetResponse {
  specialities: SpecialityModel[];
  pagination: Pagination;
}


export type {SpecialityGetResponse, SpecialityModel, Gender, DoctorRegisterModel, PatientInspectionResponse, InspectionModel, Icd10RecordModel, PatientModel, LoginApiResponse, ProfileApiInterface as ProfileApiResponse, PatientsGetApiInterface, PatientPagedListModel as ResponsePatientsGetApi, Patient, PatientPagedListModel, PatientCreateModel }
export {GenderEnum}