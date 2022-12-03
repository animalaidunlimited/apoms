DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusPatientCount!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusPatientCount(IN prm_UserName VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
DECLARE vInPatientId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientStatusId INTO vInPatientId FROM AAU.PatientStatus WHERE OrganisationId = vOrganisationId AND PatientStatus = 'In Patient';

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("patientCountInArea" , PatientCount),
JSON_OBJECT("totalPatientCount" , TotalPatientCount)
)) CensusCountData
FROM
(
	SELECT 
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("area" , data.Area),
	JSON_OBJECT("count" ,data.PatientCount)
	)) as PatientCount,
	SUM(data.PatientCount) as TotalPatientCount
	FROM 
	(
			SELECT ca.Area , Count(csa.Action) AS PatientCount 
			FROM AAU.Census c
            INNER JOIN AAU.Patient p ON p.TagNumber = c.TagNumber AND p.PatientStatusId = vInPatientId
			INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId  
			INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
			INNER JOIN  
			(  
				SELECT TagNumber, MAX(LatestCount) AS MaxLatestCount
				FROM AAU.Census c  
				INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
				WHERE SortAction IN (1,3)  
				GROUP BY TagNumber  
			) maxAction ON maxAction.TagNumber = c.TagNumber AND maxAction.MaxLatestCount = c.LatestCount
			GROUP BY ca.Area 
			ORDER BY ca.SortArea ASC
	) data
) value;


END$$
DELIMITER ;
