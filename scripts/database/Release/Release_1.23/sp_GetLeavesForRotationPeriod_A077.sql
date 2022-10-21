DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeavesForRotationPeriod !!

-- CALL AAU.sp_GetLeavesForRotationPeriod('2022-10-03','2022-10-09');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeavesForRotationPeriod( IN prm_StartDate DATE, IN prm_EndDate DATE)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of leaves for a rotation period. This brings both granted and pending leaves.

*/


SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("userId", lr.UserId),
JSON_OBJECT("granted", IFNULL(lr.Granted, 0)),
JSON_OBJECT("rotationPeriodGUID", rp.rotationPeriodGUID)
)) AS `Leaves`
FROM AAU.LeaveRequest lr
LEFT JOIN AAU.RotationPeriod rp ON rp.StartDate <= lr.LeaveEndDate AND rp.EndDate >= lr.LeaveStartDate AND rp.IsDeleted = 0
WHERE
	prm_StartDate <= lr.LeaveEndDate AND
	prm_EndDate >= lr.LeaveStartDate AND
    IFNULL(lr.Granted, 1) <> 0;

END $$


