DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_ResolveBrokenCaseDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_ResolveBrokenCaseDetails( IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/03/2023
Purpose: Fix broken cases and add the details to the BrokenCaseDetails table

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE Username = prm_Username;

START TRANSACTION;

INSERT INTO AAU.BrokenCaseDetails (OrganisationId, EmergencyCaseId, Issue) 

SELECT OrganisationId, EmergencyCaseId, 'Patient details missing' AS `Issue`
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.Patient)
AND OrganisationId = vOrganisationId

UNION ALL

SELECT DISTINCT OrganisationId, EmergencyCaseId, 'Patient problems missing'
FROM AAU.EmergencyCase
WHERE EmergencyCaseId IN (
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId NOT IN (SELECT PatientId FROM AAU.PatientProblem))
AND OrganisationId = vOrganisationId

UNION ALL

SELECT DISTINCT OrganisationId, EmergencyCaseId, 'Caller details missing'
FROM AAU.EmergencyCase
WHERE EmergencyCaseId IN (
SELECT EmergencyCaseId
FROM AAU.EmergencyCase
WHERE EmergencyCaseId NOT IN (SELECT EmergencyCaseId FROM AAU.EmergencyCaller))
AND OrganisationId = vOrganisationId;

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

SELECT 1 AS `success`;

COMMIT;

END$$
DELIMITER ;
