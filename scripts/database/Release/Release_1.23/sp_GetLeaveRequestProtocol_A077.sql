DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequestProtocol !!

-- CALL AAU.sp_GetLeaveRequestProtocol('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeaveRequestProtocol( IN prm_Username VARCHAR(45))
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
			JSON_OBJECT("dayRangeStart", lrp.DayRangeStart),
			JSON_OBJECT("dayRangeEnd", lrp.DayRangeEnd),
            JSON_OBJECT("noticeDaysRequired", lrp.NoticeDaysRequired),
			JSON_OBJECT("sortOrder", lrp.SortOrder)
			)) AS `LeaveRequestProtocol`
FROM AAU.LeaveRequestProtocol lrp
WHERE lrp.OrganisationId = vOrganisationId
AND lrp.IsDeleted = 0;

END$$


