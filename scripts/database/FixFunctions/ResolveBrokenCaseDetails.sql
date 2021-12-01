

SELECT EmergencyNumber
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.Patient);

START TRANSACTION;

INSERT INTO AAU.Patient (OrganisationId, EmergencyCaseId, Position, AnimalTypeId, PatientStatusId, PatientStatusDate)
SELECT OrganisationId, EmergencyCaseId, 1, 10, 1, CURDATE()
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.Patient);

-- COMMIT
-- ROLLBACK

START TRANSACTION;

INSERT INTO AAU.PatientProblem (PatientId, OrganisationId, ProblemId)
SELECT PatientId, OrganisationId, 42
FROM AAU.Patient
WHERE PatientId NOT IN (SELECT PatientId FROM AAU.PatientProblem);

SELECT DISTINCT EmergencyNumber
FROM AAU.EmergencyCase
WHERE EmergencyCaseId IN (
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId NOT IN (SELECT PatientId FROM AAU.PatientProblem));

-- COMMIT

START TRANSACTION;

INSERT INTO AAU.EmergencyCaller (EmergencyCaseId, CallerId, PrimaryCaller)
SELECT EmergencyCaseId, -1, 1
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.EmergencyCaller);

SELECT DISTINCT EmergencyNumber
FROM AAU.EmergencyCase
WHERE EmergencyCaseId IN (
SELECT EmergencyCaseId
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.EmergencyCaller));

-- Let's see how many duplicate callers we have
SELECT EmergencyCaseId
FROM AAU.EmergencyCaller
GROUP BY EmergencyCaseId, CallerId
HAVING COUNT(1) > 1



