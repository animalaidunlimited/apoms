DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationAreaPositions !!

-- CALL AAU.sp_GetRotationAreaPositions('Jim', 1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationAreaPositions( IN prm_UserName VARCHAR(45), IN prm_IncludeDeleted TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 12/02/2023
Purpose: Retrieve a list of positions for the rota

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

 	SELECT 
 			JSON_ARRAYAGG(
 			JSON_MERGE_PRESERVE(
 			JSON_OBJECT("rotationAreaPositionId", rap.`RotationAreaPositionId`),
            JSON_OBJECT("rotationAreaId", rap.`RotationAreaId`),
            JSON_OBJECT("rotationArea", ra.`RotationArea`),
 			JSON_OBJECT("rotationAreaPosition", rap.`RotationAreaPosition`),
			JSON_OBJECT("sortOrder", rap.`SortOrder`),
			JSON_OBJECT("isDeleted", rap.`IsDeleted`),
			JSON_OBJECT("colour", IFNULL(rap.`Colour`,'#ffffff')) 
 			)) AS `RotationAreaPositions`
     FROM AAU.RotationAreaPosition rap
     INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rap.RotationAreaId
     WHERE rap.OrganisationId = vOrganisationId
     AND (IFNULL(rap.IsDeleted,0) = prm_IncludeDeleted OR prm_IncludeDeleted = 1)
     AND rap.`RotationAreaPositionId` > 0;
    
END$$

