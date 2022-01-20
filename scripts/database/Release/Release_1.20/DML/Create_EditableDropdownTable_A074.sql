DROP TABLE IF EXISTS AAU.EditableDropdown;

CREATE TABLE AAU.EditableDropdown
(
EditableDropdownId INT AUTO_INCREMENT NOT NULL,
Dropdown VARCHAR(64),
DisplayName VARCHAR(64),
Request VARCHAR(64),
TableName VARCHAR(64),
PRIMARY KEY(EditableDropdownId)
);

INSERT INTO AAU.EditableDropdown (Dropdown, DisplayName, Request, TableName) VALUES
('animalType', 'Animal Type', 'AnimalTypes', 'AnimalType'),
('callOutcomes', 'Call Outcomes', 'CallOutcomes', 'CallOutcome'),
('emergencyCodes', 'Emergency codes', 'EmergencyCodes', 'EmergencyCode'),
('patientStates', 'Patient States', 'PatientStates', 'PatientStatus'),
('callTypes', 'Call Types', 'CallTypes', 'CallType'),
('surgerySite', 'Surgery Site', 'SurgerySite', 'SurgerySite'),
('surgeryType', 'Surgery Type', 'SurgeryType', 'SurgeryType'),
('patientCallerInteractionOutcomes', 'Patient Caller Interaction Outcomes', 'PatientCallerInteractionOutcomes', 'PatientCallerInteractionOutcome'),
('getStreetTreatMainProblem', 'StreetTreat Main Problem', 'GetStreetTreatMainProblem', 'MainProblem'),
('getTreatmentAreas', 'Treatment Areas', 'GetTreatmentAreas', 'TreatmentArea'),
('problem', 'Problem', 'Problems', 'Problems');

