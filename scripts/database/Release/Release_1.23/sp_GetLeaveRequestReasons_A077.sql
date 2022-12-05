DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequestReasons !!

-- CALL AAU.sp_GetLeaveRequestReasons('Jim');

DELIMITER $$
CREATE  PROCEDURE AAU.sp_GetLeaveRequestReasons(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 20/11/2022
Purpose: Used to return list of leave request reasons
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("leaveRequestReasonId", LeaveRequestReasonId),
	JSON_OBJECT("leaveRequestReason", LeaveRequestReason),
    JSON_OBJECT("sortArea", SortOrder)
	)) LeaveRequestReasons
FROM AAU.LeaveRequestReason
WHERE OrganisationId = vOrganisationId
AND IsDeleted = 0;

END$$

DELIMITER ;
