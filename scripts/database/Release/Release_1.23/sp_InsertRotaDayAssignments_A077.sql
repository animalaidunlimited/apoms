DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertRotaDayAssignments !!

-- CALL AAU.sp_InsertRotaDayAssignments('Jim', 4);
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
DECLARE vOrganisationId INTEGER;

SET vRotationPeriodExists = 0;
SET vSuccess = 0;
SET vOrganisationId = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE Username = prm_Username;

SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotaDayAssignment WHERE RotationPeriodId = prm_RotationPeriodId AND IsDeleted = 0;

IF vRotationPeriodExists = 0 THEN

UPDATE AAU.RotationPeriod SET `Locked` = 1 WHERE RotationPeriodId = prm_RotationPeriodId;

-- SELECT * FROM AAU.RotaDayAssignment;

-- Let's inset the assignments
INSERT INTO AAU.RotaDayAssignment ( RotaDayDate, RotationPeriodId, RotationRoleShiftSegmentId, RotationAreaPositionId, UserId, RotationUserId, Sequence )
SELECT
	RotaDayDate,
	RotationPeriodId,
	RotationRoleShiftSegmentId,
	RotationAreaPositionId,
	UserId,
	RotationUserId,
	ROW_NUMBER() OVER (PARTITION BY RotaDayDate ORDER BY raSortOrder, rapSortOrder, EmployeeNumber)
FROM
(
SELECT
DATE_ADD(p.StartDate, INTERVAL t.Id DAY) AS `RotaDayDate`,
p.RotationPeriodId,
rrss.RotationRoleShiftSegmentId,
rap.RotationAreaPositionId,
IF(rmi.UserId = -1 OR lr.LeaveRequestId IS NOT NULL OR LOCATE(WEEKDAY(DATE_ADD(p.StartDate, INTERVAL t.Id DAY)), u.FixedDayOff) > 0, NULL, rmi.UserId) AS `UserId`,
NULLIF(rmi.UserId, -1) AS `RotationUserId`,
 ra.SortOrder AS `raSortOrder`,
 rap.SortOrder AS `rapSortOrder` ,
 u.EmployeeNumber
FROM AAU.RotaMatrixItem rmi
INNER JOIN AAU.RotationPeriod p ON p.RotationPeriodGUID = rmi.RotationPeriodGUID AND p.IsDeleted = 0
INNER JOIN AAU.AreaShift a ON a.AreaShiftGUID = rmi.AreaShiftGUID AND a.IsDeleted = 0
INNER JOIN AAU.RotationRoleShiftSegment rrss ON rrss.rotationRoleId = a.rotationRoleId
INNER JOIN AAU.RotationAreaPosition rap ON rap.RotationAreaPositionId = rrss.ShiftSegmentTypeId
INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rap.RotationAreaId
INNER JOIN AAU.Tally t ON t.Id <= (DATEDIFF(p.EndDate, p.StartDate))
LEFT JOIN AAU.User u ON u.UserId = rmi.UserId
LEFT JOIN AAU.LeaveRequest lr ON lr.UserId = rmi.UserId AND DATE_ADD(p.StartDate, INTERVAL t.Id DAY) BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE p.RotationPeriodId = prm_RotationPeriodId

UNION ALL

SELECT	
	DATE_ADD(rp.StartDate, INTERVAL t.Id DAY), -- RotaDayDate
    rp.RotationPeriodId,
	-1, -- rotationRoleShiftSegmentId
    -1, -- rotationAreaPositionId
	u.UserId, -- UserId
    u.UserId, -- RotationUserId
    -1,
    -1,    
	u.EmployeeNumber
FROM AAU.RotationPeriod rp
INNER JOIN AAU.Tally t ON t.Id < 7
INNER JOIN AAU.User u ON LOCATE(WEEKDAY(DATE_ADD(rp.StartDate, INTERVAL t.Id DAY)), u.FixedDayOff) > 0 AND u.fixedDayOff NOT LIKE '[-1]'
LEFT JOIN AAU.LeaveRequest lr ON lr.UserId = u.UserId AND DATE_ADD(rp.StartDate, INTERVAL t.Id DAY) BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE rp.RotationPeriodId = prm_RotationPeriodId
AND u.OrganisationId = vOrganisationId
) assignments;

-- Now let's insert the leave requests.



SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,prm_RotationPeriodId,'RotaDayAssignment','Insert', NOW());

ELSE

SELECT 2 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$

