interface IReportSettings {
  reportMode: TestType;
  classId: string;
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
  studentIds: string[];
}
