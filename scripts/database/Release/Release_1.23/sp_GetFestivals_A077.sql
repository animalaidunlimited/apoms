DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetFestivals !!

-- CALL AAU.sp_GetFestivals('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetFestivals( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/2022
Purpose: Retrieve a list of leave requests

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("festivalId", f.FestivalId),
			JSON_OBJECT("festival", f.Festival),
            JSON_OBJECT("localName", f.LocalName),
            JSON_OBJECT("noticeDaysRequired", f.NoticeDaysRequired),
			JSON_OBJECT("sortOrder", f.SortOrder)
			)) AS `Festivals`
FROM AAU.Festival f
WHERE f.OrganisationId = vOrganisationId
AND f.IsDeleted = 0;

END$$
