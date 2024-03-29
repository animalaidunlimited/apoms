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

		With ShiftSegmentsCTE AS
		(
		SELECT 		rrss.RotationRoleId,
					JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
					JSON_OBJECT("rotationRoleShiftSegmentId", rrss.RotationRoleShiftSegmentId),
					JSON_OBJECT("shiftSegmentTypeId", rrss.ShiftSegmentTypeId),
					JSON_OBJECT("startTime", TIME_FORMAT(rrss.`StartTime`, "%H:%i")),
					JSON_OBJECT("endTime", TIME_FORMAT(rrss.`EndTime`, "%H:%i")),
					JSON_OBJECT("nextDay", IF(rrss.nextDay = 1, CAST(true AS JSON), CAST(false AS JSON)))
					)) AS `ShiftSegments`
		FROM AAU.RotationRoleShiftSegment rrss
        WHERE rrss.IsDeleted = 0
		GROUP BY rrss.RotationRoleId
		)

 	SELECT 
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotationRoleId", rr.`RotationRoleId`),
			JSON_OBJECT("rotationRole", rr.`RotationRole`),
			JSON_OBJECT("colour", rr.`Colour`),
			JSON_OBJECT("shiftSegments", ss.`ShiftSegments`),
			JSON_OBJECT("sortOrder", rr.`SortOrder`),
			JSON_OBJECT("isDeleted", rr.`IsDeleted`)             
 			)) AS `RotationRoles`
	FROM AAU.RotationRole rr
    LEFT JOIN ShiftSegmentsCTE ss ON ss.RotationRoleId = rr.RotationRoleId
	WHERE rr.OrganisationId = vOrganisationId
    AND (IFNULL(rr.IsDeleted,0) = prm_IncludeDeleted OR prm_IncludeDeleted = 1);
    
END$$

