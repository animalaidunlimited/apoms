DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentList !!

DELIMITER $$

-- CALL AAU.sp_GetTreatmentList(2);

CREATE PROCEDURE AAU.sp_GetTreatmentList ( IN prm_CensusAreaId INT )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

-- TODO: Replace this with a paramater that comes from the treatment list so it's possible to see the treatment list for a specific date.
DECLARE prm_TreatmentListDate DATE;
SET prm_TreatmentListDate = CURDATE();

WITH PatientCTE AS (
SELECT p.EmergencyCaseId, p.PatientId, p.PatientStatusId, ps.PatientStatus, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament, p.Age,
CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END AS `ReleaseReady`
FROM AAU.Patient p
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
WHERE p.PatientId IN (SELECT PatientId FROM AAU.TreatmentList WHERE NULLIF(OutAccepted,0) IS NULL AND InCensusAreaId = prm_CensusAreaId)
AND IFNULL(p.PatientStatusDate, prm_TreatmentListDate) = IF(p.PatientStatusId > 1, prm_TreatmentListDate, IFNULL(p.PatientStatusDate, prm_TreatmentListDate))
),
EmergencyCaseCTE AS (
SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)
AND ec.CallOutcomeId = 1
),
RecordSplitCTE AS
(
SELECT
CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admission'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'unaccepted'
WHEN tl.OutAccepted = 0 THEN 'rejected'
ELSE 'accepted' END AS `RecordType`,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListId" , tl.treatmentListId),
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("PatientStatusId" , p.PatientStatusId),
JSON_OBJECT("PatientStatus" , p.PatientStatus),
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
JSON_OBJECT("Moved to", IF(tl.OutAccepted IS NULL AND tl.OutCensusAreaId IS NOT NULL, tl.OutCensusAreaId, NULL)),
JSON_OBJECT("Admission", IF(tl.Admission = 1 AND InAccepted = 1, 0 , 1)), -- This prevents records showing up in new admissions the first move.
JSON_OBJECT("Move accepted", tl.InAccepted),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails		
FROM PatientCTE p	
	INNER JOIN EmergencyCaseCTE ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND NULLIF(OutAccepted, 0) IS NULL AND OutOfHospital IS NULL AND InCensusAreaId = prm_CensusAreaId
	INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
	INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
	LEFT JOIN
	(
		SELECT DISTINCT t.PatientId
		FROM AAU.Treatment t
		WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
	) t ON t.PatientId = p.PatientId
GROUP BY CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admission'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'unaccepted'
WHEN tl.OutAccepted = 0 THEN 'rejected'
ELSE 'accepted' END
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListType",RecordType),
JSON_OBJECT("treatmentList",patientDetails)
)) AS `TreatmentList`
FROM RecordSplitCTE;

END $$