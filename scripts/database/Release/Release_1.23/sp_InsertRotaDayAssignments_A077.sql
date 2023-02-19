DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertRotaDayAssignments !!

-- CALL AAU.sp_InsertRotaDayAssignments('Jim', 1);
-- TRUNCATE TABLE AAU.RotaDayAssignment;

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertRotaDayAssignments( IN prm_UserName VARCHAR(45), IN prm_RotationPeriodId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 13/10/2022
Purpose: Generate the user assignments for each area shift and day in the rotation period.

*/

DECLARE vRotationPeriodExists INT;
DECLARE vSuccess INT;

SET vRotationPeriodExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotaDayAssignment WHERE RotationPeriodId = prm_RotationPeriodId AND IsDeleted = 0;

IF vRotationPeriodExists = 0 THEN

UPDATE AAU.RotationPeriod SET `Locked` = 1 WHERE RotationPeriodId = prm_RotationPeriodId;

-- SELECT * FROM AAU.RotaDayAssignment;

INSERT INTO AAU.RotaDayAssignment ( RotaDayDate, RotationPeriodId, RotationRoleShiftSegmentId, RotationAreaPositionId, UserId, RotationUserId, Sequence )
SELECT
DATE_ADD(p.StartDate, INTERVAL t.Id DAY) AS `RotaDayDate`,
p.RotationPeriodId,
rrss.RotationRoleShiftSegmentId,
rap.RotationAreaPositionId,
NULLIF(NULLIF(rmi.UserId, -1), lr.LeaveRequestId IS NOT NULL) AS `UserId`,
NULLIF(rmi.UserId, -1) AS `RotationUserId`,
ROW_NUMBER() OVER (PARTITION BY DATE_ADD(p.StartDate, INTERVAL t.Id DAY) ORDER BY ra.SortOrder, rap.SortOrder, u.EmployeeNumber)
FROM AAU.RotaMatrixItem rmi
INNER JOIN AAU.RotationPeriod p ON p.RotationPeriodGUID = rmi.RotationPeriodGUID AND p.IsDeleted = 0
INNER JOIN AAU.AreaShift a ON a.AreaShiftGUID = rmi.AreaShiftGUID AND a.IsDeleted = 0
INNER JOIN AAU.RotationRoleShiftSegment rrss ON rrss.rotationRoleId = a.rotationRoleId
INNER JOIN AAU.RotationAreaPosition rap ON rap.RotationAreaPositionId = rrss.ShiftSegmentTypeId
INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rap.RotationAreaId
INNER JOIN AAU.Tally t ON t.Id <= (DATEDIFF(p.EndDate, p.StartDate))
LEFT JOIN AAU.User u ON u.UserId = rmi.UserId
LEFT JOIN AAU.LeaveRequest lr ON lr.UserId = rmi.UserId AND DATE_ADD(p.StartDate, INTERVAL t.Id DAY) BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE p.RotationPeriodId = prm_RotationPeriodId;

SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,prm_RotationPeriodId,'RotaDayAssignment','Insert', NOW());

ELSE

SELECT 2 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$

