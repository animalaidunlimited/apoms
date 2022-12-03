DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationPeriods !!

-- CALL AAU.sp_GetRotationPeriods(2, 3, 0);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationPeriods( IN prm_RotaVersionId INT, IN prm_Limit INT, IN prm_Offset INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of rotation periods for a rota version.

*/

	WITH minMaxCTE AS (
    SELECT 
		rp.RotaVersionId,
		FIRST_VALUE(rp.RotationPeriodGUID) OVER (ORDER BY StartDate ASC) AS `FirstRotationPeriodGUID`,
		FIRST_VALUE(rp.RotationPeriodGUID) OVER (ORDER BY StartDate DESC) AS `LastRotationPeriodGUID`
    FROM AAU.RotationPeriod rp
    WHERE rp.RotaVersionId = prm_RotaVersionId
    AND rp.IsDeleted = 0
    LIMIT 1
    ),
    rotationPeriodsCTE AS (
    SELECT
		rp.RotationPeriodId,
        rp.RotationPeriodGUID,
        rp.RotaVersionId,
        rp.StartDate,
        rp.EndDate
    FROM AAU.RotationPeriod rp
    WHERE rp.RotaVersionId = prm_RotaVersionId
    AND rp.IsDeleted = 0
    ORDER BY StartDate DESC
    LIMIT prm_Limit OFFSET prm_Offset
    )
    
	SELECT 
			JSON_MERGE_PRESERVE(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("firstRotationPeriodGUID", mm.FirstRotationPeriodGUID),
            JSON_OBJECT("lastRotationPeriodGUID", mm.LastRotationPeriodGUID)
            ),
			JSON_OBJECT("rotationPeriods",
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotationPeriodId", rp.RotationPeriodId),
			JSON_OBJECT("rotationPeriodGUID", rp.RotationPeriodGUID),
            JSON_OBJECT("rotaVersionId", rp.RotaVersionId),
            JSON_OBJECT("startDate", rp.StartDate),
            JSON_OBJECT("endDate", rp.EndDate)
			)))) AS `RotationPeriods`
	FROM rotationPeriodsCTE rp
    INNER JOIN minMaxCTE mm ON mm.RotaVersionId = rp.RotaVersionId;
    
    
END$$

