DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientDetailsbyArea !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientDetailsbyArea(IN prm_Username VARCHAR(45),
												IN prm_Area VARCHAR(45))
BEGIN

/*

Modified By: Jim Mackenzie
Modified On: 07/Feb/2021
Modification: Altered to use function to return current area.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH PatientCTE AS (
SELECT p.EmergencyCaseId, p.PatientId, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament, p.Age,
CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END AS `ReleaseReady`
FROM AAU.Patient p
WHERE p.PatientStatusId IN (1,7)
AND p.IsDeleted = 0
AND p.PatientCallOutcomeId = 1
),
EmergencyCaseCTE AS (
SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)

)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Age" , p.Age),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , ec.CallDateTime),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Release ready", p.ReleaseReady),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails
FROM PatientCTE p
INNER JOIN EmergencyCaseCTE ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
LEFT JOIN
(
SELECT DISTINCT t.PatientId
FROM AAU.Treatment t
WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
) t ON t.PatientId = p.PatientId
LEFT JOIN
(
	SELECT
		tl.PatientId,
		ta.Area
	FROM AAU.TreatmentList tl
	INNER JOIN AAU.TreatmentArea ta ON ta.AreaId = tl.InTreatmentAreaId
    WHERE OutOfHospital IS NULL
    AND OutDate IS NULL
) LatestArea ON LatestArea.PatientId = p.PatientId
WHERE COALESCE(LatestArea.Area, AAU.fn_GetAreaForAnimalType(vOrganisationId, p.AnimalTypeId), 'Other') = prm_Area;



END$$
DELIMITER ;
