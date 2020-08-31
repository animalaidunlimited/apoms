DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusByTagNumber!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusByTagNumber(IN prm_UserName Varchar(45),
IN prm_TagNumber Varchar(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 10/08/2020
Purpose: Fetches census data for census table in hospital manager tab

Modified By: Jim Mackenzie
Modified On: 31/08/2020
Modifications: Formatted code and added datediff to show how long animal has been in each area.
*/

SELECT
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE
		(
			JSON_OBJECT("date" ,output.EntryDate),
			JSON_OBJECT("area" ,ca.Area),
			JSON_OBJECT("action" , csa.Action),
			JSON_OBJECT("days" , DATEDIFF(IFNULL(output.ExitDate, IFNULL(PatientStatusDate, CURDATE())), output.EntryDate))
		)
) AS Census

FROM 
(
	SELECT
	parent.AreaId,
	parent.ActionId,
	parent.TagNumber,
    parent.PatientId,
	parent.CensusDate AS EntryDate,
	child.CensusDate AS ExitDate,
	parent.LatestCount AS first,
	child.LatestCount AS next
	FROM AAU.Census parent
	LEFT JOIN AAU.Census child ON	parent.LatestCount = child.LatestCount - 1 AND
									parent.TagNumber = child.TagNumber
	WHERE parent.TagNumber = prm_TagNumber
) output
LEFT JOIN AAU.Patient p ON p.PatientId = output.PatientId
INNER JOIN AAU.CensusArea ca ON ca.AreaId = output.AreaId
INNER JOIN AAU.CensusAction csa ON csa.ActionId = output.ActionId
ORDER BY output.first ASC;

END$$
DELIMITER ;
