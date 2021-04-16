DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentAreas!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetTreatmentAreas(IN prm_UserName VARCHAR(45))
BEGIN

/*
Developer: Jim Mackenzie
Development Date: 28/Mar/2021
Purpose: This procedure brings back the census areas for the treatment list. The lists 
		 are split into main areas and areas that will display in the 'other' section.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	IFNULL(TreatmentListMain, 0) TreatmentListMain,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("areaId", AreaId),
	JSON_OBJECT("areaName", Area),
    JSON_OBJECT("sortArea", SortArea),
    JSON_OBJECT("abbreviation", Abbreviation),
    JSON_OBJECT("mainArea", TreatmentListMain)    
	)) AreaList
FROM AAU.CensusArea
WHERE OrganisationId = vOrganisationId
GROUP BY IFNULL(TreatmentListMain, 0);

END