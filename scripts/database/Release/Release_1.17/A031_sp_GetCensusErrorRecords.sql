DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusErrorRecords

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusErrorRecords(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created by: Arpit Trivedi
Created Date: 03/02/2021
Purpose: To get all records with incorrect census.
*/


WITH FirstCensusCTE as
(SELECT p.PatientId,p.TagNumber,
SUM(CASE 
WHEN c.ActionId = 1
THEN 1
ELSE 0
END) AS Admission,
SUM(CASE 
WHEN c.ActionId = 3 
THEN 1
ELSE 0
END) AS MovedIn,
SUM(CASE 
WHEN c.ActionId = 2
THEN 1
ELSE 0
END) AS MovedOut
FROM AAU.Census c
INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE p.PatientStatusId IN (1,7)
AND ec.CallOutcomeId =1
AND p.AnimalTypeId IN (5,10)
GROUP BY p.PatientId,p.TagNumber),

SecondCensusCTE as (
	SELECT subCTE.PatientId,
    subCTE.TagNumber,
    IF(subCTE.caseCount = 1, subCTE.Area, "Unknown area") as "CurrentArea",
    subCTE.caseCount
    FROM 
    (SELECT 
	p.PatientId,
	p.TagNumber,
    ca.Area,
	SUM(CASE WHEN c.ActionId = 1 OR c.ActionId = 3
	THEN 1
	ELSE -1
	END) AS caseCount
	FROM AAU.Census c
	INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
	INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
	WHERE p.PatientStatusId IN (1,7)
	AND ec.CallOutcomeId =1
	AND p.AnimalTypeId IN (5,10)
	GROUP BY p.PatientId,p.TagNumber,c.AreaId) subCTE
)

SELECT 
cct.TagNumber,
sct.CurrentArea,
CONCAT(
"Census error: ",
IF(Admission = 0 , " No admission",""),
IF(Admission = 1 , " Admission",""),
IF(Admission > 1 , " Multiple admission",""),
IF(MovedIn <> MovedOut, " with moved in and out mismatch","")
) AS errorType
FROM FirstCensusCTE cct
INNER JOIN SecondCensusCTE sct ON sct.PatientId = cct.PatientId
WHERE ((Admission <> 1) OR (MovedIn <> MovedOut))
OR ((sct.caseCount = -1) OR (sct.caseCount > 1));

END$$
DELIMITER ;
