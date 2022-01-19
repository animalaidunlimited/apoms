DROP TABLE IF EXISTS AAU.EditableDropdown;

CREATE TABLE AAU.EditableDropdown
(
EditableDropdownId INT AUTO_INCREMENT NOT NULL,
Dropdown VARCHAR(64),
DisplayName VARCHAR(64),
Request VARCHAR(64),
PRIMARY KEY(EditableDropdownId)
);

INSERT INTO AAU.EditableDropdown (Dropdown, DisplayName, Request) VALUES
('animalType', 'Animal Type', 'AnimalTypes'),
('callOutcomes', 'Call Outcomes', 'CallOutcomes'),
('emergencyCodes', 'Emergency codes', 'EmergencyCodes'),
('patientStates', 'Patient States', 'PatientStates'),
('callTypes', 'Call Types', 'CallTypes'),
('surgerySite', 'Surgery Site', 'SurgerySite'),
('surgeryType', 'Surgery Type', 'SurgeryType'),
('patientCallerInteractionOutcomes', 'Patient Caller Interaction Outcomes', 'PatientCallerInteractionOutcomes'),
('getStreetTreatMainProblem', 'StreetTreat Main Problem', 'GetStreetTreatMainProblem'),
('getTreatmentAreas', 'Treatment Areas', 'GetTreatmentAreas'),
('problem', 'Problem', 'Problems');

