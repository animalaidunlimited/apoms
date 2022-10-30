DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationAreas !!

-- CALL AAU.sp_GetRotationAreas('Jim', );

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationAreas( IN prm_UserName VARCHAR(45), IN prm_IncludeDeleted TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of areas that can be assigned to a rota

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

 	SELECT 
 			JSON_ARRAYAGG(
 			JSON_MERGE_PRESERVE(
 			JSON_OBJECT("rotationAreaId", ra.`RotationAreaId`),
 			JSON_OBJECT("rotationArea", ra.`RotationArea`),
			JSON_OBJECT("sortOrder", ra.`SortOrder`),
			JSON_OBJECT("isDeleted", ra.`IsDeleted`),
			JSON_OBJECT("colour", ra.`Colour`) 
 			)) AS `RotationAreas`
     FROM AAU.RotationArea ra
     WHERE ra.OrganisationId = vOrganisationId
     AND (IFNULL(ra.IsDeleted,0) = prm_IncludeDeleted OR prm_IncludeDeleted = 1);
    
END$$

