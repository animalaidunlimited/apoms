DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationRoles !!

-- CALL AAU.sp_GetRotationRoles('Jim', 1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationRoles( IN prm_UserName VARCHAR(45), IN prm_IncludeDeleted TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of roles that can be assigned to a shift

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

 	SELECT 
 			JSON_ARRAYAGG(
 			JSON_MERGE_PRESERVE(
 			JSON_OBJECT("rotationRoleId", rr.`RotationRoleId`),
 			JSON_OBJECT("rotationRole", rr.`RotationRole`),
            JSON_OBJECT("rotationAreaId", rr.`RotationAreaId`),
            JSON_OBJECT("rotationArea", ra.`RotationArea`),
            JSON_OBJECT("rotationAreaSequence", ra.`SortOrder`),
            JSON_OBJECT("rotationAreaColour", ra.`Colour`),
            JSON_OBJECT("colour", rr.`Colour`),
            JSON_OBJECT("startTime", TIME_FORMAT(rr.`StartTime`, "%H:%i")),
            JSON_OBJECT("endTime", TIME_FORMAT(rr.`EndTime`, "%H:%i")),
            JSON_OBJECT("breakStartTime", TIME_FORMAT(rr.`BreakStartTime`, "%H:%i")),
            JSON_OBJECT("breakEndTime", TIME_FORMAT(rr.`BreakEndTime`, "%H:%i")),
             JSON_OBJECT("sortOrder", rr.`SortOrder`),
             JSON_OBJECT("isDeleted", rr.`IsDeleted`)             
 			)) AS `RotationRoles`
	FROM AAU.RotationRole rr
    INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rr.RotationAreaId
	WHERE rr.OrganisationId = vOrganisationId
    AND (IFNULL(rr.IsDeleted,0) = prm_IncludeDeleted OR prm_IncludeDeleted = 1);
    
END$$

