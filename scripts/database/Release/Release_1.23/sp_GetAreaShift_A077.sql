DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAreaShifts !!

-- CALL AAU.sp_GetAreaShifts(2);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAreaShifts( IN prm_RotaVersionId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of area shifts for a rota version.

*/

	SELECT 
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("areaShiftId", a.AreaShiftId),
            JSON_OBJECT("rotationAreaId", a.RotationAreaId),
            JSON_OBJECT("rotationAreaSequence", a.AreaSequence),
			JSON_OBJECT("areaShiftGUID", a.AreaShiftGUID),
            JSON_OBJECT("rotaVersionId", a.RotaVersionId),
            JSON_OBJECT("colour", a.Colour),
            JSON_OBJECT("sequence", a.Sequence),
            JSON_OBJECT("rotationRoleId", a.RotationRoleId),
            JSON_OBJECT("areaRowSpan", a.AreaRowSpan),
            JSON_OBJECT("rotationAreaColour", a.RotationAreaColour)		
			)) AS `AreaShifts`
	FROM     
     (  
    SELECT	a.AreaShiftId,
			a.RotationAreaId,
			ra.Sequence AS `RotationAreaSequence`,
			a.AreaShiftGUID,
			a.RotaVersionId,
			a.Colour,
			a.Sequence,
			a.RotationRoleId,
			IF(ROW_NUMBER() OVER (PARTITION BY a.RotationAreaId ORDER BY a.Sequence) = 1,  
							COUNT(1) OVER (PARTITION BY a.RotationAreaId ORDER BY a.RotationAreaId ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING),
							0) AS `AreaRowSpan`,
			ra.Sequence AS `AreaSequence`,
			ra.Colour AS `RotationAreaColour`
	FROM AAU.AreaShift a
    INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = a.RotationAreaId
    WHERE a.RotaVersionId = prm_RotaVersionId
    AND a.IsDeleted = 0
    ) a;
    
END$$

