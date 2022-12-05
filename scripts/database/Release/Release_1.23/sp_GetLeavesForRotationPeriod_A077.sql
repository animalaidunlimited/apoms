DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeavesForPeriod !!

-- CALL AAU.sp_GetLeavesForPeriod('2022-10-24','2022-10-30');
-- CALL AAU.sp_GetLeavesForPeriod('2022-10-17','2022-10-23');
-- CALL AAU.sp_GetLeavesForPeriod('2022-10-10','2022-10-16');
-- CALL AAU.sp_GetLeavesForPeriod('2022-10-03','2022-10-09');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeavesForPeriod( IN prm_StartDate DATE, IN prm_EndDate DATE)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of leaves for a period. This brings both granted and pending leaves.

*/


SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("leaveRequestId", lr.LeaveRequestId),
JSON_OBJECT("userId", lr.UserId),
JSON_OBJECT("granted", IF(lr.Granted IS NULL, 'Pending','Granted')),
JSON_OBJECT("startDate", lr.LeaveStartDate),
JSON_OBJECT("endDate", lr.LeaveEndDate)
)) AS `Leaves`
FROM AAU.LeaveRequest lr
WHERE
	prm_StartDate <= lr.LeaveEndDate AND
	prm_EndDate >= lr.LeaveStartDate AND
    IFNULL(lr.Granted, 1) <> 0;

END $$

