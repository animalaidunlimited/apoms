DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAreaShifts !!

-- CALL AAU.sp_GetAreaShifts(1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAreaShifts( IN prm_RotaVersionId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of area shifts for a rota version.

*/

	SELECT IFNULL(
				JSON_ARRAYAGG(
				JSON_MERGE_PRESERVE(
				JSON_OBJECT("areaShiftId", a.AreaShiftId),
				JSON_OBJECT("rotationAreaId", ra.RotationAreaId),
				JSON_OBJECT("rotationAreaSortOrder", ra.SortOrder),
				JSON_OBJECT("areaShiftGUID", a.AreaShiftGUID),
				JSON_OBJECT("rotaVersionId", a.RotaVersionId),
				JSON_OBJECT("colour", a.Colour),
				JSON_OBJECT("sortOrder", a.Sequence),
				JSON_OBJECT("rotationRoleId", a.RotationRoleId),
				JSON_OBJECT("areaRowSpan", 0), -- We're going to handle this in the front end
				JSON_OBJECT("rotationArea", ra.RotationArea),
				JSON_OBJECT("rotationAreaColour", ra.Colour)
				)),"[]") AS `AreaShifts`
	FROM AAU.AreaShift a
		INNER JOIN AAU.RotationRole rr ON rr.RotationroleId = a.RotationroleId
		INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rr.RotationAreaId    
		WHERE a.RotaVersionId = prm_RotaVersionId
		AND a.IsDeleted = 0;
    
END$$

