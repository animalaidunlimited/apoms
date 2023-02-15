DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationAreas !!

-- CALL AAU.sp_GetRotationAreas('Jim', 1);

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
            JSON_OBJECT("scheduleManagerId", ra.`ScheduleManagerId`),
            JSON_OBJECT("scheduleManager", CONCAT(u.`EmployeeNumber`,' - ', u.`FirstName`)),
			JSON_OBJECT("sortOrder", ra.`SortOrder`),
			JSON_OBJECT("isDeleted", ra.`IsDeleted`),
			JSON_OBJECT("colour", ra.`Colour`) 
 			)) AS `RotationAreas`
     FROM AAU.RotationArea ra
     LEFT JOIN AAU.User u ON u.UserId = ra.ScheduleManagerId
     WHERE ra.OrganisationId = vOrganisationId
     AND ra.`RotationAreaId` > 0
     AND (IFNULL(ra.IsDeleted,0) = prm_IncludeDeleted OR prm_IncludeDeleted = 1);
    
END$$

