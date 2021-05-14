DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusPatientCount !!
DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentAreaPatientCount !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentAreaPatientCount(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 09/09/2020
Purpose: Get the total count of animals in each area.

Modified By: Jim Mackenzie
Modified On: 07/Feb/2021
Modification: Altered to use function to return current area.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH TotalAreaCount
AS
(
SELECT
DataCount.Area,
SUM(LowPriority) AS LowPriority,
SUM(NormalPriority) AS NormalPriority,
SUM(HighPriority) AS HighPriority,
SUM(Infants) AS Infants,
SUM(Adults) AS Adults,
COUNT(1) AS TotalCount
FROM
(SELECT
COALESCE(LatestArea.Area, AAU.fn_GetAreaForAnimalType(vOrganisationId, p.AnimalTypeId), 'Other') AS Area,
IF(p.TreatmentPriority = 4,1,0) AS LowPriority,
IF(p.TreatmentPriority = 3,1,0) AS NormalPriority,
IF(p.TreatmentPriority = 2,1,0) AS HighPriority,
IF(p.Age = 1, 1, 0) AS Infants,
IF(p.Age <> 1, 1, 0) AS Adults
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId AND ec.OrganisationId = vOrganisationId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
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
WHERE p.PatientStatusId IN (1,7)
AND p.IsDeleted = 0
AND p.PatientCallOutcomeId = 1
 )
DataCount
GROUP BY DataCount.Area)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("area" , data.Area),
JSON_OBJECT("lowPriority" , LowPriority),
JSON_OBJECT("normalPriority" , NormalPriority),
JSON_OBJECT("highPriority" , HighPriority),
JSON_OBJECT("infants" , Infants),
JSON_OBJECT("adults" , Adults),
JSON_OBJECT("count" , data.TotalCount))) as PatientCountData
FROM
(
SELECT Area, LowPriority, NormalPriority, HighPriority, Infants, Adults, TotalCount FROM TotalAreaCount tc
UNION ALL
SELECT "Total", 0, 0, 0, 0, 0, SUM(TotalCount) FROM TotalAreaCount
) data;


END$$
DELIMITER ;
