import patients from '../../data/patients';
import { v1 as uuid } from 'uuid';
import { Patient, PublicPatient, NonSensitivePatient, Entry, NewEntry, FormAddPatient } from '../types';

const getPatients = (): Patient[] => {
  return patients;
};

const getPublicPatients = (): PublicPatient[] => {
  return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
    id,
    name,
    dateOfBirth,
    gender,
    occupation,
  }));
};

const getNonSensitivePatients = (): NonSensitivePatient[] => {
  return patients.map(({ id, name, dateOfBirth, gender, occupation, entries }) => ({
    id,
    name,
    dateOfBirth,
    gender,
    occupation,
    entries
  }));
};

const addPatient = (patient: FormAddPatient): Patient => {
  const newPatient = {
    id: uuid(),
    entries: [],
    ...patient
  };

  patients.push(newPatient);
  return newPatient;
};

const findById = (id: string): Patient | undefined => {
  const patient = patients.find(p => p.id === id);
  return patient;
};

const addEntry = (patient: Patient, newEntry: NewEntry) => {
  const entry: Entry = { ...newEntry, id: uuid() };
  const updatedPatient = { ...patient, entries: patient.entries.concat(entry) };
  return updatedPatient;
};

export default {
  getPatients,
  getPublicPatients,
  getNonSensitivePatients,
  addPatient,
  findById,
  addEntry
};