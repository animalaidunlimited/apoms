DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusPatientCount !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusPatientCount(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 9/09/20
Purpose: Get the total count of animals in each area.
*/


WITH TotalAreaCount
AS
(SELECT 
DataCount.Area,
COUNT(1) AS TotalCount 
FROM
(SELECT CASE  WHEN at.AnimalTypeId IN (5,10) THEN LatestArea.Area
			WHEN at.AnimalTypeId IN (3,8) THEN 'Cat area'
			WHEN at.AnimalTypeId IN (1,2,4,6,12,13,18,32) THEN IFNULL(LatestArea.Area, 'Large animal hospital')
			WHEN at.AnimalTypeId IN (7,11,17,27) THEN 'Sheep area'
			WHEN at.AnimalTypeId IN (14,16,22,23,25) THEN 'Bird treatment area'
			ELSE 'Other'
            END AS Area			
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN
(
	SELECT
		c.TagNumber,
		ca.Area,
		c.ActionId,
		ROW_NUMBER() OVER ( PARTITION BY c.TagNumber ORDER BY c.CensusDate DESC, cac.SortAction DESC) RNum
	FROM AAU.Census c
	INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
	INNER JOIN AAU.CensusAction cac ON cac.ActionId = c.ActionId
) LatestArea ON LatestArea.TagNumber = p.TagNumber AND LatestArea.RNum = 1
WHERE p.PatientStatusId IN (1,7)
AND p.PatientCallOutcomeId = 1
 ) 
DataCount
GROUP BY DataCount.Area),
TotalAnimalCount AS (SELECT SUM(totalCount) as TotalCount from TotalAreaCount)

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("area" , data.Area),
JSON_OBJECT("count" , data.totalCount))) as PatientCountData
FROM(
SELECT Area, TotalCount FROM TotalAreaCount tc
UNION ALL
SELECT "Total" , TotalCount FROM TotalAnimalCount tac)data;


END$$
DELIMITER ;
