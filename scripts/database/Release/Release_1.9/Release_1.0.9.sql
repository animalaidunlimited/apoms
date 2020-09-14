DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusPatientCount!!

DELIMITER $$


CREATE PROCEDURE AAU.sp_GetCensusPatientCount(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 9/09/20
Purpose: Get the total count of animals in each area.
*/


DROP TEMPORARY TABLE IF EXISTS AAU.TotalAreaCount;

CREATE TEMPORARY TABLE AAU.TotalAreaCount
AS
(SELECT 
DataCount.Area,
DataCount.totalCount 
FROM
(SELECT CASE  WHEN at.AnimalTypeId IN (5,10) THEN ca.Area 
			WHEN at.AnimalTypeId IN (3,8) THEN 'Cat area'
			WHEN at.AnimalTypeId IN (1,2,4,6,12,13,15,19) THEN 'Large animal hospital'
			WHEN at.AnimalTypeId IN (7,11,17,27) THEN 'Sheep area'
			WHEN at.AnimalTypeId IN (14,16,22,23,25) THEN 'Bird treatment area'
			ELSE 'Other'
            END AS Area,
			Count(1) as totalCount
FROM AAU.Patient p
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN  
(  
SELECT TagNumber, MAX(LatestCount) AS MaxLatestCount  
FROM AAU.Census c  
INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
WHERE SortAction IN (1,3)  
GROUP BY TagNumber  
) maxAction ON maxAction.TagNumber = p.TagNumber
LEFT JOIN AAU.Census c ON c.TagNumber = maxAction.TagNumber
    AND maxAction.MaxLatestCount = c.LatestCount
LEFT JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
WHERE p.PatientStatusId = 1
GROUP BY ca.Area)DataCount);

DROP TEMPORARY TABLE IF EXISTS AAU.TotalAnimalCount;
CREATE TEMPORARY TABLE AAU.TotalAnimalCount AS (SELECT SUM(totalCount) as TotalCount from AAU.TotalAreaCount);

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("area" , data.Area),
JSON_OBJECT("count" , data.totalCount))) as PatientCountData
from(
SELECT * FROM AAU.TotalAreaCount tc
UNION ALL
SELECT "Total" , TotalCount FROM AAU.TotalAnimalCount tac)data;


END$$



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientDetailsbyArea!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPatientDetailsbyArea(IN prm_Username VARCHAR(45),
												IN prm_Area VARCHAR(45))

BEGIN

/*
Created By: Arpit Trivedi
Created On: 11/09/20
Purpose: Get the detais of each animal in an area.
*/

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencynumber" , patientDetails.EmergencyNumber),
JSON_OBJECT("tagnumber" , patientDetails.TagNumber),
JSON_OBJECT("species" , patientDetails.AnimalType),
JSON_OBJECT("callername" , patientDetails.Name),
JSON_OBJECT("number" , patientDetails.Number),
JSON_OBJECT("calldate" , DATE_Format(patientDetails.CallDatetime,"%Y-%m-%d"))
))patientDetails
FROM(
SELECT	ec.EmergencyNumber,  
		p.TagNumber,
		aty.AnimalType, 
		clr.Name,
		clr.Number,
		ec.CallDateTime
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	AND ec.CallOutcomeId = 1
    AND p.PatientStatusId = 1
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
INNER JOIN AAU.Caller clr ON clr.CallerId = ec.CallerId
WHERE PatientId IN
(
SELECT c.PatientId  
	FROM AAU.Census c
	INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId  
	INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
	INNER JOIN  
	(  
		SELECT TagNumber, MAX(LatestCount) AS MaxLatestCount  
		FROM AAU.Census c  
		INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
		WHERE SortAction IN (1,3)  
		GROUP BY TagNumber  
	) maxAction ON maxAction.TagNumber = c.TagNumber 
    AND maxAction.MaxLatestCount = c.LatestCount
    AND ca.Area = prm_Area
)
ORDER BY p.TagNumber ASC)patientDetails;

END$$




