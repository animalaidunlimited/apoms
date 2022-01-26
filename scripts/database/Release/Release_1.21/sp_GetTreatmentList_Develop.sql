DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentList !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentList( IN prm_TreatmentAreaId INT, IN prm_TreatmentListDate DATE )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

WITH PatientCTE AS (
	SELECT p.EmergencyCaseId, p.PatientId, p.PatientStatusId, ps.PatientStatus, p.PatientStatusDate, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament, p.Age,
	p.Sex, p.Description, p.KnownAsName, p.MainProblems,
	CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END AS `ReleaseReady`
	FROM AAU.Patient p
	INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
	WHERE p.PatientId IN (SELECT PatientId FROM AAU.TreatmentList WHERE NULLIF(OutAccepted,0) IS NULL AND InTreatmentAreaId = prm_TreatmentAreaId)
	AND IFNULL(p.PatientStatusDate, prm_TreatmentListDate) = IF(p.PatientStatusId > 1, prm_TreatmentListDate, IFNULL(p.PatientStatusDate, prm_TreatmentListDate))
	AND p.PatientCallOutcomeId = 1
    AND p.PatientStatusId IN (1,7)
),
EmergencyCaseCTE AS (
	SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
	FROM AAU.EmergencyCase ec
	WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)
),
RecordSplitCTE AS
(
SELECT
CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admissions'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'moved in from'
WHEN tl.OutAccepted = 0 THEN 'rejected from'
ELSE 'accepted' END AS `RecordType`,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListId" , tl.TreatmentListId),
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("PatientStatusId" , p.PatientStatusId),
JSON_OBJECT("PatientStatus" , p.PatientStatus),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Age" , p.Age),
JSON_OBJECT("Sex" , p.Sex),
JSON_OBJECT("Description" , p.Description),
JSON_OBJECT("Main Problems" , p.MainProblems),
JSON_OBJECT("animalTypeId" , p.animalTypeId),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , ec.CallDateTime),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Known as name", p.KnownAsName),
JSON_OBJECT("Release ready", p.ReleaseReady),
JSON_OBJECT("Actioned by area", ca.TreatmentArea),
JSON_OBJECT("Moved to", IF(tl.OutAccepted IS NULL AND tl.OutTreatmentAreaId IS NOT NULL, tl.OutTreatmentAreaId, NULL)),
JSON_OBJECT("Admission", IF(tl.Admission = 1 AND InAccepted IS NULL, 1, 0)), -- This prevents records showing up in new admissions the first move.
JSON_OBJECT("Move accepted", tl.InAccepted),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails		
FROM PatientCTE p	
	INNER JOIN EmergencyCaseCTE ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN
    (
		SELECT InAccepted, Admission, PatientId, TreatmentListId, OutOfHospital, InTreatmentAreaId, InDate,
        OutTreatmentAreaId, OutAccepted, OutDate,
		IF(OutAccepted = 0, OutTreatmentAreaId,IFNULL(LAG(InTreatmentAreaId, 1) OVER (PARTITION BY PatientId ORDER BY TreatmentListId), OutTreatmentAreaId)) as `ActionedByArea`
		FROM AAU.TreatmentList tld
        WHERE (prm_TreatmentListDate <= IFNULL(CAST(IF(OutAccepted IS NULL, NULL, OutDate) AS DATE), prm_TreatmentListDate)
        AND CAST(InDate AS DATE) <= prm_TreatmentListDate)
    ) tl ON tl.PatientId = p.PatientId
    AND NULLIF(OutAccepted, 0) IS NULL
    AND InTreatmentAreaId = prm_TreatmentAreaId
    AND
		(
			NULLIF(OutOfHospital,0) IS NULL
			OR
			CAST(p.PatientStatusDate AS DATE) = prm_TreatmentListDate
		)
	INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
	INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
    LEFT JOIN AAU.TreatmentArea ca ON ca.TreatmentAreaId = tl.ActionedByArea
	LEFT JOIN
	(
		SELECT DISTINCT t.PatientId
		FROM AAU.Treatment t
		WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
	) t ON t.PatientId = p.PatientId
GROUP BY CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admissions'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'moved in from'
WHEN tl.OutAccepted = 0 THEN 'rejected from'
ELSE 'accepted' END
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListType",RecordType),
JSON_OBJECT("treatmentList",patientDetails)
)) AS `TreatmentList`
FROM RecordSplitCTE;

END$$
DELIMITER ;
