DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationPeriod !!

-- CALL AAU.sp_GetRotationPeriod(2, 1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationPeriod( IN prm_RotaVersionId INT, IN prm_RotationPeriodId INT)
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
        rp.`Name`,
        rp.StartDate,
        rp.EndDate,
        IF(rp.locked = 1, CAST(TRUE AS JSON), CAST(FALSE AS JSON)) AS `Locked`
    FROM AAU.RotationPeriod rp
    WHERE rp.RotationPeriodId = prm_RotationPeriodId
    AND rp.IsDeleted = 0
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
            JSON_OBJECT("name", rp.`Name`),
            JSON_OBJECT("startDate", rp.StartDate),
            JSON_OBJECT("endDate", rp.EndDate),
            JSON_OBJECT("locked", rp.`Locked`)
			)))) AS `RotationPeriod`
	FROM rotationPeriodsCTE rp
    INNER JOIN minMaxCTE mm ON mm.RotaVersionId = rp.RotaVersionId
    GROUP BY mm.FirstRotationPeriodGUID, mm.LastRotationPeriodGUID;
    
    
END$$

