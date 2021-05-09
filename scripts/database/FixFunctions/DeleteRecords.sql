SELECT p.EmergencyCaseId, p.PatientId, stc.StreetTreatCaseId FROM AAU.Patient p
INNER JOIN AAU.StreetTreatCase stc ON stc.PatientId = p.PatientId
WHERE p.TagNumber = 'ST4327';

SELECT *
FROM AAU.Patient
WHERE EmergencyCaseId IN (91917,92010);


START TRANSACTION;

DELETE FROM AAU.Visit WHERE StreetTreatCaseId = 9393;
DELETE FROM AAU.StreetTreatCase WHERE PatientId = 122171;
DELETE FROM AAU.PatientProblem WHERE PatientId = 122171;
DELETE FROM AAU.Patient WHERE PatientId = 122171;
DELETE FROM AAU.EmergencyCaller WHERE EmergencyCaseId = 92010;
DELETE FROM AAU.EmergencyCase WHERE EmergencyCaseId = 92010;

COMMIT