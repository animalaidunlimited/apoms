

SELECT EmergencyNumber, 'Patient details missing' AS `Problem`
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.Patient)

UNION ALL

SELECT DISTINCT EmergencyNumber, 'Patient problems missing'
FROM AAU.EmergencyCase
WHERE EmergencyCaseId IN (
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId NOT IN (SELECT PatientId FROM AAU.PatientProblem))

UNION ALL

SELECT DISTINCT EmergencyNumber, 'Caller details missing'
FROM AAU.EmergencyCase
WHERE EmergencyCaseId IN (
SELECT EmergencyCaseId
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.EmergencyCaller));

START TRANSACTION;

INSERT INTO AAU.Patient (OrganisationId, EmergencyCaseId, GUID, AnimalTypeId, PatientStatusId, PatientStatusDate)
SELECT OrganisationId, EmergencyCaseId, UUID(), 10, 1, CURDATE()
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.Patient);

INSERT INTO AAU.PatientProblem (PatientId, OrganisationId, ProblemId)
SELECT PatientId, OrganisationId, 42
FROM AAU.Patient
WHERE PatientId NOT IN (SELECT PatientId FROM AAU.PatientProblem);

INSERT INTO AAU.EmergencyCaller (EmergencyCaseId, CallerId, PrimaryCaller)
SELECT EmergencyCaseId, -1, 1
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.EmergencyCaller);

COMMIT;

-- Let's see how many duplicate callers we have
SELECT EmergencyCaseId
FROM AAU.EmergencyCaller
GROUP BY EmergencyCaseId, CallerId
HAVING COUNT(1) > 1


SELECT DISTINCT ec.EmergencyNumber
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE p.PatientId IN (180828,180845,180809,180837,180838)
OR ec.EmergencyCaseId = 149355;

SELECT *
FROM AAU.EmergencyCase
WHERE EmergencyNumber = 157668;

SELECT *
FROM AAU.Patient
WHERE EmergencyCaseId = 149943

SELECT COUNT(1)
FROM AAU.EmergencyCase ec
WHERE YEAR(CallDateTime) = 2022



SELECT *
FROM AAU.EmergencyCase ec
WHERE YEAR(CallDateTime) = 2022
ORDER BY EmergencyNumber DESC

SELECT 33836 - 33256

SELECT 158307 - 124471

