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
			JSON_OBJECT("date" ,output.EntryDate),
			JSON_OBJECT("area" ,ca.Area),
			JSON_OBJECT("action" , csa.Action),
			JSON_OBJECT("days" , IFNULL(output.ExitDate - output.EntryDate,0)),
			JSON_OBJECT("order" , output.LatestCount)
		)
) AS Census

FROM 
(
	SELECT
	parent.AreaId,
	parent.ActionId,
	parent.TagNumber,
	parent.CensusDate AS EntryDate,
	child.CensusDate AS ExitDate,
	parent.LatestCount
	FROM AAU.Census parent
	LEFT JOIN AAU.Census child ON	parent.LatestCount = child.LatestCount - 1 AND
									parent.TagNumber = child.TagNumber
	WHERE parent.TagNumber = prm_TagNumber
) output
INNER JOIN AAU.CensusArea ca ON ca.AreaId = output.AreaId
INNER JOIN AAU.CensusAction csa ON csa.ActionId = output.ActionId;

END$$
DELIMITER ;