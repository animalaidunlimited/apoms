DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotaDayAssignmentsByRotationPeriodId !!

-- CALL AAU.sp_GetRotaDayAssignmentsByRotationPeriodId(10);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotaDayAssignmentsByRotationPeriodId( IN prm_RotationPeriodId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 13/10/2022
Purpose: Retrieve the rotation period with an array of days, each day containing an array of the assignments

*/



With BaseCTE AS 
(
SELECT
	rda.RotationPeriodId,
	rda.RotaDayDate,
	rda.RotaDayId,
	rda.AreaShiftId,
	IF(lr.Granted = 1 AND rda.UserId = rda.RotationUserId, NULL, rda.UserId) AS 'UserId',
	rda.RotationUserId,
	lr.LeaveRequestId,
    CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
    WHEN lr.Granted = 0 THEN 'Denied'
    WHEN lr.Granted = 1 THEN 'Granted'
    WHEN lr.Granted = 2 THEN 'Partially'
    ELSE NULL
    END AS `LeaveGranted`,
    CONCAT(u.EmployeeNumber, ' - ', u.FirstName) AS `LeaveUser`,
	rr.RotationRole,
    ra.RotationAreaId,
	ra.RotationArea,
    ra.SortOrder AS `RotationAreaSortOrder`,
    ra.Colour AS `RotationAreaColour`,
	TIME_FORMAT(rr.StartTime, '%H:%i') AS StartTime,
	TIME_FORMAT(rr.EndTime, '%H:%i') AS EndTime,
	TIME_FORMAT(rda.ActualStartTime, '%h:%i:%s') AS ActualStartTime,
	TIME_FORMAT(rda.ActualEndTime, '%h:%i:%s') AS ActualEndTime,
	TIME_FORMAT(rr.BreakStartTime, '%H:%i') AS BreakStartTime,
	TIME_FORMAT(rr.BreakEndTime, '%H:%i') AS BreakEndTime,
	TIME_FORMAT(rda.ActualBreakStartTime, '%h:%i:%s') AS ActualBreakStartTime,
	TIME_FORMAT(rda.ActualBreakEndTime, '%h:%i:%s') AS ActualBreakEndTime,
    rda.Notes,
	IF(ROW_NUMBER() OVER (PARTITION BY rda.RotaDayDate, ra.RotationAreaId ORDER BY rda.RotaDayDate, a.Sequence) = 1,  
					COUNT(1) OVER (PARTITION BY rda.RotaDayDate, ra.RotationAreaId ORDER BY ra.RotationAreaId ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING),
					0) AS `AreaRowSpan`
	FROM AAU.RotaDayAssignment rda
	INNER JOIN AAU.RotationPeriod p ON p.RotationPeriodId = rda.RotationPeriodId AND p.IsDeleted = 0
	INNER JOIN AAU.AreaShift a 		ON a.AreaShiftId = rda.AreaShiftId AND a.IsDeleted = 0
    INNER JOIN AAU.RotationRole rr 	ON rr.RotationRoleId = a.RotationRoleId AND rr.IsDeleted = 0
    INNER JOIN AAU.RotationArea ra 	ON ra.RotationAreaId = rr.RotationAreaId AND ra.IsDeleted = 0
	LEFT JOIN AAU.LeaveRequest lr 	ON lr.UserId = rda.RotationUserId AND rda.RotaDayDate BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
    LEFT JOIN AAU.User u			ON u.UserId = lr.UserId
WHERE p.RotationPeriodId = prm_RotationPeriodId AND
	  rda.IsDeleted = 0 AND
	  a.IsDeleted = 0 AND
	  p.IsDeleted = 0
      
UNION ALL

-- Now let's add in any leave requests

SELECT 
	rp.RotationPeriodId,
	DATE_ADD(lr.LeaveStartDate, INTERVAL t.Id DAY),
	-1,
	-1,
	lr.UserId,
	lr.UserId,
	lr.LeaveRequestId,
	CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
		WHEN lr.Granted = 0 THEN 'Denied'
		WHEN lr.Granted = 1 THEN 'Granted'
		ELSE NULL
	END AS `LeaveGranted`,
	NULL,
	'LEAVE',
	-1,
	'Leave',
	-1,
	'#999999',
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	IF(ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY lr.UserId DESC) = 1, ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY lr.UserId), 0)
FROM AAU.LeaveRequest lr
INNER JOIN AAU.Tally t ON t.Id <= (lr.LeaveEndDate - lr.LeaveStartDate)
INNER JOIN AAU.RotationPeriod rp ON DATE_ADD(lr.LeaveStartDate, INTERVAL t.Id DAY) BETWEEN rp.StartDate AND rp.EndDate
WHERE RotationPeriodId = prm_RotationPeriodId
AND lr.Granted = 1

UNION ALL

-- Let's get all of the fixed off records
SELECT
	rp.RotationPeriodId,
	DATE_ADD(rp.StartDate, INTERVAL t.Id DAY),
	-1,
	-1,
	u.UserId,
	u.UserId,
	lr.LeaveRequestId,
	CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
		WHEN lr.Granted = 0 THEN 'Denied'
		WHEN lr.Granted = 1 THEN 'Granted'
		ELSE NULL
		END AS `LeaveGranted`,
	NULL,
	'FIXED OFF',
	-2,
	'Fixed Off',
	-2,
	'#999999',
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	IF(ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY u.UserId DESC) = 1, ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY u.UserId), 0)
FROM AAU.RotationPeriod rp
INNER JOIN AAU.Tally t ON t.Id < 7
INNER JOIN AAU.User u ON u.FixedDayOff = WEEKDAY(DATE_ADD(rp.StartDate, INTERVAL t.Id DAY))
LEFT JOIN AAU.LeaveRequest lr 	ON lr.UserId = u.UserId AND DATE_ADD(rp.StartDate, INTERVAL t.Id DAY) BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE RotationPeriodId = prm_RotationPeriodId

),
rotaDayAssignmentCTE AS
(
SELECT RotationPeriodId,
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotaDayDate", RotaDayDate),
			JSON_OBJECT("rotaDayAssignments", 
				JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
						JSON_OBJECT("rotaDayId", RotaDayId),
                        JSON_OBJECT("areaRowSpan", AreaRowSpan),
						JSON_OBJECT("areaShiftId", AreaShiftId),
						JSON_OBJECT("userId", UserID),
						JSON_OBJECT("rotationUserId", RotationUserId),
						JSON_OBJECT("leaveRequestId", LeaveRequestId),
                        JSON_OBJECT("leaveGranted", LeaveGranted),
                        JSON_OBJECT("leaveUser", LeaveUser),
                        JSON_OBJECT("rotationRole", RotationRole),
                        JSON_OBJECT("rotationAreaId", RotationAreaId),
                        JSON_OBJECT("rotationArea", RotationArea),
                        JSON_OBJECT("rotationAreaColour", RotationAreaColour),
                        JSON_OBJECT("rotationAreaSortOrder", RotationAreaSortOrder),
                        JSON_OBJECT("plannedShiftStartTime", StartTime),
                        JSON_OBJECT("plannedShiftEndTime", EndTime),
                        JSON_OBJECT("actualShiftStartTime", ActualStartTime),
                        JSON_OBJECT("actualShiftEndTime", ActualEndTime),
                        JSON_OBJECT("plannedBreakStartTime", BreakStartTime),
                        JSON_OBJECT("plannedBreakEndTime", BreakEndTime),
                        JSON_OBJECT("actualBreakStartTime", ActualBreakStartTime),
                        JSON_OBJECT("actualBreakEndTime", ActualBreakEndTime),
                        JSON_OBJECT("notes", Notes)
					)
				)
			)
		) AS `RotaDayAssignments`
FROM BaseCTE
GROUP BY RotationPeriodId,
		 RotaDayDate
)

SELECT
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("rotationPeriodId", RotationPeriodId),
		JSON_OBJECT("rotaDays", 
			JSON_ARRAYAGG(	
			RotaDayAssignments
			)
		)
	) AS `RotationPeriodAssignments`
FROM rotaDayAssignmentCTE
GROUP BY RotationPeriodId;

END$$

