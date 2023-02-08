DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentAreas !!

-- CALL AAU.sp_GetTreatmentAreas('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentAreas(IN prm_UserName VARCHAR(45))
BEGIN

/*
Developer: Jim Mackenzie
Development Date: 28/Mar/2021
Purpose: This procedure brings back the Treatment areas for the treatment list. The lists 
		 are split into main areas and areas that will display in the 'other' section.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	treatmentAreaId AS `areaId`,
	treatmentArea AS `areaName`,
	IsDeleted,
	SortOrder,
	abbreviation AS `abbreviation`,
	treatmentListMain AS `mainArea`
FROM AAU.TreatmentArea
WHERE OrganisationId = vOrganisationId;
    
END$$

