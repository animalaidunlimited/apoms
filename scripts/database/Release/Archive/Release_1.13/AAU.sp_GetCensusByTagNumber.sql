DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusByTagNumber!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusByTagNumber(IN prm_UserName Varchar(45), IN prm_TagNumber Varchar(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 10/08/2020
Purpose: Fetches census data for census table in hospital manager tab
*/

SELECT
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE
		(
			JSON_OBJECT("date" ,output.CensusDate),
			JSON_OBJECT("area" ,ca.Area),
			JSON_OBJECT("action" , csa.Action),
			JSON_OBJECT("days" , DayCount),
			JSON_OBJECT("order" , output.LatestCount)
		)
) AS Census

FROM 
(
SELECT
	c.AreaId,
	c.ActionId,
	c.TagNumber,
    c.CensusDate,
	DATEDIFF(IFNULL(LEAD(CensusDate, 1) OVER (PARTITION BY TagNumber ORDER BY LatestCount), CURRENT_DATE), c.CensusDate) AS DayCount,
	c.LatestCount
	FROM AAU.Census c
	WHERE c.TagNumber = prm_TagNumber
) output
INNER JOIN AAU.CensusArea ca ON ca.AreaId = output.AreaId
INNER JOIN AAU.CensusAction csa ON csa.ActionId = output.ActionId;

END$$
DELIMITER ;