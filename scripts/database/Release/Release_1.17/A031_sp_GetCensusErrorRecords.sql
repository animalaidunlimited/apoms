DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusErrorRecords

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusErrorRecords(IN prm_UserName VARCHAR(45))
BEGIN

/* 
Created by: Arpit Trivedi
Created Date: 09/02/2021
Purpose: To show census errors.
*/

SELECT  
ErrorRecords.PatientId AS "PatientId",
ErrorRecords.TagNumber AS "TagNumber",
DATE_FORMAT(ec.CallDateTime, "%Y-%m-%d") AS "CallDateTime",
DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%d") AS "AdmissionTime",
cl.Name AS "CallerName",
cl.Number AS "Number",
CONCAT(
	IF(ErrorRecords.PatientId IS NULL,"No Patient ",""), 
	IF(ErrorRecords.MovementError = 1,"Wrong movement ",""), 
	IF(ErrorRecords.noAdmissionError = -1,"No admission ", 
	IF(ErrorRecords.noAdmissionError > 1, "Duplicate admission ","")),
	"error"
) AS "ErrorLog"
FROM
(
	SELECT 
    Distinct censusErrorRecords.PatientId, 
    censusErrorRecords.TagNumber, 
    1 AS MovementError, 
    noAdmissionTags.noAdmissionError 
	FROM 
	(
		SELECT census.CensusDate,
		census.PatientId, census.Area, census.Action, census.TagNumber, census.PreArea,census.PreAction,census.PreCensusDate,
		(
			CASE 
			WHEN census.Action = 'Admission' AND census.PreArea IS NULL
			THEN 0  
			WHEN census.Action = 'Moved Out' AND census.PreArea = census.Area AND census.PreAction IN ('Admission','Moved In') 
			THEN 0
			WHEN census.Action = 'Moved In' AND census.PreArea <> census.Area AND census.PreAction = 'Moved Out' AND census.CensusDate = census.PreCensusDate
			THEN 0
			ELSE 1
			END
		) AS ErrorFlag
		FROM
		(
			SELECT c.CensusDate,
			c.AreaId,
			ca.Area , 
			c.ActionId ,
			csa.Action, 
			c.TagNumber, 
			c.PatientId,
			LAG(ca.Area,1) 
				OVER( 
				PARTITION BY c.TagNumber
				ORDER BY c.CensusDate, c.ActionId
				) as PreArea,
			LAG(csa.Action,1) 
				OVER(
				PARTITION BY c.TagNumber
				ORDER BY c.CensusDate, c.ActionId
				) as PreAction,
			LAG(c.CensusDate,1) 
			OVER( 
				PARTITION BY c.TagNumber
				ORDER BY c.CensusDate, c.ActionId
				) as PreCensusDate
			FROM AAU.Census c
			INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
			INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId
		) census
	) censusErrorRecords
	LEFT JOIN(
		SELECT
		noAdmission.PatientId,
		(
			CASE WHEN noAdmission.Admission = 0
			THEN -1
			WHEN noAdmission.Admission > 1 
			THEN 2
			ELSE 0
			END
		) AS noAdmissionError
		FROM
		(
			SELECT p.PatientId,
			SUM(
				CASE 
				WHEN c.ActionId = 1
				THEN 1
				ELSE 0
				END
			) AS Admission       
			FROM AAU.Patient p
			INNER JOIN AAU.Census c ON c.PatientId = p.PatientId
			INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
			WHERE p.PatientStatusId IN (1,7) 
			AND ec.CallOutcomeId =1
			AND p.AnimalTypeId IN (5,10)
			GROUP BY p.PatientId,p.TagNumber
        ) noAdmission 
	) AS noAdmissionTags ON noAdmissionTags.PatientId = censusErrorRecords.PatientId
	WHERE censusErrorRecords.ErrorFlag = 1 
) ErrorRecords
LEFT JOIN AAU.Patient p ON p.PatientId = ErrorRecords.PatientId
LEFT JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN AAU.Caller cl ON cl.CallerId = ecr.CallerId
WHERE ecr.PrimaryCaller = 1;


END$$
DELIMITER ;
