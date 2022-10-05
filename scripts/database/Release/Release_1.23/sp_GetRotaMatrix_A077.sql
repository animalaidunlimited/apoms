DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotaMatrix !!

-- CALL AAU.sp_GetRotaMatrix(2,'b83add4a-d267-5827-bf1e-0be6965f91f7');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotaMatrix( IN prm_RotaVersionId INT, IN prm_RotationPeriodGUIDs VARCHAR(256))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve the matrix for a rota version

*/
	SELECT 
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("areaShiftGUID", rm.AreaShiftGUID),
            JSON_OBJECT("rotationPeriodGUID", rm.RotationPeriodGUID),
            JSON_OBJECT("rotaVersionId", rm.RotaVersionId),
            JSON_OBJECT("assignedUserId", rm.UserId)
			)) AS `RotaMatrix`
	FROM AAU.RotaMatrixItem rm
    INNER JOIN AAU.RotationPeriod rp ON rp.RotationPeriodGUID = rm.RotationPeriodGUID AND rp.IsDeleted = 0
    WHERE rm.RotaVersionId = prm_RotaVersionId
    AND FIND_IN_SET (rm.RotationPeriodGUID, prm_RotationPeriodGUIDs);
    
END$$

