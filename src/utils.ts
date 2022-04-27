import {
  NewPatient,
  Gender,
  Entry,
  EntryType,
  SickLeave,
  Discharge,
  NewBaseEntry,
  NewEntry,
  Diagnosis,
  HealthCheckRating,
  FormAddPatient,
} from './types';

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

export const parseToString = (param: unknown, paramName: string): string => {
  if (!param || !isString(param)) {
    throw new Error(`Incorrect or missing ${paramName}: ${param || ""}`);
  }
  return param;
};

const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date)) && (/^\d{4}-\d{2}-\d{2}$/).test(date);
};

const parseToDate = (param: unknown, paramName: string): string => {
  if (!param || !isString(param) || !isDate(param)) {
    throw new Error(`Incorrect or missing ${paramName}: ${param || ""}`);
  }
  return param;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isGender = (param: any): param is Gender => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(Gender).includes(param);
};

const parseGender = (gender: unknown): Gender => {
  if (!gender || !isGender(gender)) {
    throw new Error('Incorrect or missing gender: ' + gender);
  }

  return gender;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isArrayOfEntries = (param: any[]): param is Entry[] => {
  const hasInvalidEntry = param.some(entry => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return !Object.values(EntryType).includes(entry.type);
  });

  return !hasInvalidEntry;
};

const parseEntries = (entries: unknown): Entry[] => {
  if (!entries || !Array.isArray(entries) || !isArrayOfEntries(entries)) {
    throw new Error(`Incorrect or missing entries: ${JSON.stringify(entries)}`);
  }
  return entries;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseEntryType = (entryType: any): EntryType => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (!Object.values(EntryType).includes(entryType)) {
    throw new Error(`Incorrect or missing type: ${entryType || ""}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return entryType;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isArrayOfStrings = (param: any[]): param is string[] => {
  const hasANonString = param.some((item) => {
    return !isString(item);
  });

  return !hasANonString;
};

const parseDiagnosisCodes = (diagnosisCodes: unknown): Array<Diagnosis["code"]> => {
  if (!Array.isArray(diagnosisCodes) || !isArrayOfStrings(diagnosisCodes)) {
    throw new Error("Incorrect or missing diagnoses");
  }

  return diagnosisCodes;
};

type NewPatientFields = { name: unknown, dateOfBirth: unknown, ssn: unknown, gender: unknown, occupation: unknown, entries: unknown };

const toNewPatient = ({ name, dateOfBirth, ssn, gender, occupation, entries } : NewPatientFields): NewPatient => {
  const newPatient: NewPatient = {
    name: parseToString(name, 'name'),
    dateOfBirth: parseToDate(dateOfBirth, "date of birth"),
    ssn: parseToString(ssn, 'ssn'),
    gender: parseGender(gender),
    occupation: parseToString(occupation, 'occupation'),
    entries: parseEntries(entries),
  };

  return newPatient;
};

type NewFormAddPatientFields = { name: unknown, dateOfBirth: unknown, ssn: unknown, gender: unknown, occupation: unknown };

export const toNewFormAddPatient = ({ name, dateOfBirth, ssn, gender, occupation } : NewFormAddPatientFields): FormAddPatient => {
  const newPatient: FormAddPatient = {
    name: parseToString(name, 'name'),
    dateOfBirth: parseToDate(dateOfBirth, "date of birth"),
    ssn: parseToString(ssn, 'ssn'),
    gender: parseGender(gender),
    occupation: parseToString(occupation, 'occupation'),
  };

  return newPatient;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toNewBaseEntry = (object: any): NewBaseEntry => {
  const newBaseEntry: NewBaseEntry = {
    type: parseEntryType(object.type),
    description: parseToString(object.description, "description"),
    date: parseToDate(object.date, 'date'),
    specialist: parseToString(object.specialist, "specialist"),
  };

  if (object.diagnosisCodes) {
    newBaseEntry.diagnosisCodes = parseDiagnosisCodes(object.diagnosisCodes);
  }

  return newBaseEntry;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isHealthCheckRating = (param: any): param is HealthCheckRating => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(HealthCheckRating).includes(Number(param));
};

const parseHealthCheckRating = (healthCheckRating: unknown): HealthCheckRating => {
  if (!healthCheckRating || !isHealthCheckRating(healthCheckRating)) {
    throw new Error(
      `Incorrect or missing health check rating: ${healthCheckRating || ""}`
    );
  }
  return healthCheckRating;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseSickLeave = (object: any): SickLeave => {
  if (!object) throw new Error("Missing sick leave");

  return {
    startDate: parseToDate(object.startDate, "sick leave start date"),
    endDate: parseToDate(object.endDate, "sick leave end date"),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseDischarge = (object: any): Discharge => {
  if (!object) throw new Error("Missing discharge information");

  return {
    date: parseToDate(object.date, "discharge date"),
    criteria: parseToString(object.criteria, "discharge criteria"),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toNewEntry = (object: any): NewEntry => {
  const newBaseEntry = toNewBaseEntry(object) as NewEntry;

  switch (newBaseEntry.type) {
  case EntryType.HealthCheck:
    return {
      ...newBaseEntry,
      healthCheckRating: parseHealthCheckRating(object.healthCheckRating),
    };
  case EntryType.OccupationalHealthcare:
    const newEntry = {
      ...newBaseEntry,
      employerName: parseToString(object.employerName, "employer name"),
    };

    if (object.sickLeave) {
      newEntry.sickLeave = parseSickLeave(object.sickLeave);
    }

    return newEntry;
  case EntryType.Hospital:
    return { ...newBaseEntry, discharge: parseDischarge(object.discharge) };
  default:
    return assertNever(newBaseEntry);
  }
};

export default toNewPatient;