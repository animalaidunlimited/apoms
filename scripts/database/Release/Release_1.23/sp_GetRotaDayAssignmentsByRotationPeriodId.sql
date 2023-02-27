DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotaDayAssignmentsByRotationPeriodId !!

-- CALL AAU.sp_GetRotaDayAssignmentsByRotationPeriodId('Jim',1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotaDayAssignmentsByRotationPeriodId( IN prm_Username VARCHAR(45), IN prm_RotationPeriodId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 13/10/2022
Purpose: Retrieve the rotation period with an array of days, each day containing an array of the assignments

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE Username = prm_Username;


With RotationRoleShiftSegmentsCTE AS (

SELECT rrss.RotationRoleId,
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("startTime", rrss.StartTime),
		JSON_OBJECT("endTime", rrss.EndTime),
		JSON_OBJECT("nextDay", rrss.nextDay),
		JSON_OBJECT("shiftSegmentTypeId", rrss.ShiftSegmentTypeId)
	)
) AS `rotationRoleShiftSegments`

FROM AAU.RotationRoleShiftSegment rrss
WHERE rrss.IsDeleted = 0
AND OrganisationId = vOrganisationId
GROUP BY rrss.RotationRoleId
),
RoleAndAreaCTE AS
(
	SELECT rrss.RotationRoleId,
	rr.RotationRole,
	rrss.rotationRoleShiftSegments
	FROM RotationRoleShiftSegmentsCTE rrss
	INNER JOIN AAU.RotationRole rr ON rr.RotationRoleId = rrss.RotationRoleId
),

BaseCTE AS 
(
SELECT
	rda.RotationPeriodId,
	rda.RotaDayDate,
	rda.RotaDayId,
	IF(lr.Granted = 1 AND rda.UserId = lr.UserId, NULL, rda.UserId) AS 'UserId',
    u.EmployeeNumber,
    CONCAT(u.EmployeeNumber, ' - ', u.FirstName) AS `UserCode`,
	rda.RotationUserId,
	lr.LeaveRequestId,
    CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
    WHEN lr.Granted = 0 THEN 'Denied'
    WHEN lr.Granted = 1 THEN 'Granted'
    WHEN lr.Granted = 2 THEN 'Partially'
    ELSE NULL
    END AS `LeaveGranted`,
    CONCAT(lu.EmployeeNumber, ' - ', lu.FirstName) AS `LeaveUser`,    
    rda.RotationAreaPositionId AS `rotationAreaPositionId`,
    rap.RotationAreaPosition AS `rotationAreaPosition`,
	ra.RotationAreaId AS `rotationAreaId`,
	ra.RotationArea AS `rotationArea`,  
    
	rr.RotationAreaPositionId AS `plannedRotationAreaPositionId`,
	rr.RotationAreaPosition AS `plannedRotationAreaPosition`,  
    rr.RotationAreaId AS `plannedRotationAreaId`,
	rr.RotationArea AS `plannedRotationArea`,
    
    IF(rr.NextDay = 1, CAST(true AS JSON), CAST(false AS JSON)) AS `nextDay`,
   
    TIME_FORMAT(rr.StartTime, '%h:%i %p') AS `plannedStartTime`,
    TIME_FORMAT(rr.EndTime, '%h:%i %p') AS `plannedEndTime`,
    TIME_FORMAT(rda.ActualStartTime, '%h:%i') AS `actualStartTime`,
    TIME_FORMAT(rda.ActualEndTime, '%h:%i') AS `actualEndTime`,
    IFNULL(ra.Colour, rr.Colour) AS `rotationAreaColour`,
    IF(((CONV(SUBSTRING(ra.Colour , 2, 2), 16, 10) * 299) + (CONV(SUBSTRING(ra.Colour , 4, 2), 16, 10) * 587) + (CONV(SUBSTRING(ra.Colour , 6, 2), 16, 10) * 114)) / 1000 > 155, '#000000', '#ffffff') AS `rotationAreaFontColour`,

    rda.Sequence,
    rda.Notes
	FROM AAU.RotaDayAssignment rda
    INNER JOIN 
    (
		SELECT 	rrss.RotationRoleShiftSegmentId, rrss.RotationRoleId, rpa.RotationAreaPositionId,
        CASE rrss.ShiftSegmentTypeId
			WHEN -1 THEN 'Tea break'
			WHEN -2 THEN 'Lunch break'
        ELSE rpa.RotationAreaPosition END AS `RotationAreaPosition`,
				ra.RotationAreaId, ra.RotationArea, ra.Colour, rrss.StartTime, rrss.EndTime, rrss.nextDay
		FROM AAU.RotationRoleShiftSegment rrss
        LEFT JOIN AAU.RotationAreaPosition rpa ON rpa.RotationAreaPositionId = rrss.ShiftSegmentTypeId
		LEFT JOIN AAU.RotationArea ra ON ra.RotationAreaId = rpa.RotationAreaId
		WHERE rrss.IsDeleted = 0
			AND rrss.OrganisationId = vOrganisationId
	) rr ON rr.RotationRoleShiftSegmentId = rda.RotationRoleShiftSegmentId
    LEFT JOIN AAU.RotationAreaPosition rap		ON rap.RotationAreaPositionId = rda.RotationAreaPositionId
    LEFT JOIN AAU.RotationArea ra				ON ra.RotationAreaId = rap.RotationAreaId
	LEFT JOIN AAU.LeaveRequest lr 				ON lr.UserId = rda.UserId AND rda.RotaDayDate BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
    LEFT JOIN AAU.User lu						ON lu.UserId = lr.UserId
    LEFT JOIN AAU.User u						ON u.UserId = rda.UserId
WHERE rda.RotationPeriodId = prm_RotationPeriodId
      
UNION ALL

-- Now let's add in any leave requests

SELECT 
    rp.RotationPeriodId,
	DATE_ADD(lr.LeaveStartDate, INTERVAL t.Id DAY), -- RotaDayDate
	-1, -- RotaDayId
	lr.UserId, -- UserId
    u.EmployeeNumber, -- EmployeeNumber
    NULL, -- UserCode
	lr.UserId, -- RotationUserId
	lr.LeaveRequestId,
	CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
		WHEN lr.Granted = 0 THEN 'Denied'
		WHEN lr.Granted = 1 THEN 'Granted'
		ELSE NULL
	END AS `LeaveGranted`, 
    NULL, -- LeaveUser
    	-1, -- rotationAreaPositionId
    'LEAVE', -- rotationAreaPosition
    -1, -- rotationAreaId
	'LEAVE', -- rotationArea
    -1, -- plannedRotationAreaPositionId
    'LEAVE', -- plannedRotationAreaPosition
    -1, -- plannedRotationAreaId
	'LEAVE', -- plannedRotationArea
    CAST(false AS JSON), -- nextDay
	NULL, -- StartTime
    NULL, -- EndTime
    NULL, -- ActualStartTime
    NULL, -- ActualEndTime
    '#999999', -- Colour
    '#ffffff', -- RotationAreaFontColour
    -2, -- Sequence
    NULL -- Notes
FROM AAU.LeaveRequest lr
INNER JOIN AAU.User u ON u.UserId = lr.UserId
INNER JOIN AAU.Tally t ON t.Id <= (lr.LeaveEndDate - lr.LeaveStartDate)
INNER JOIN AAU.RotationPeriod rp ON DATE_ADD(lr.LeaveStartDate, INTERVAL t.Id DAY) BETWEEN rp.StartDate AND rp.EndDate
WHERE RotationPeriodId = prm_RotationPeriodId
AND lr.Granted = 1
AND lr.OrganisationId = vOrganisationId

UNION ALL

-- Let's get all of the fixed off records
SELECT
	rp.RotationPeriodId,
	DATE_ADD(rp.StartDate, INTERVAL t.Id DAY), -- RotaDayDate
	-1, -- RotaDayId
	u.UserId, -- UserId
    u.EmployeeNumber, -- EmployeeNumber
    NULL, -- UserCode
	u.UserId, -- RotationUserId
	lr.LeaveRequestId,
	CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
		WHEN lr.Granted = 0 THEN 'Denied'
		WHEN lr.Granted = 1 THEN 'Granted'
		ELSE NULL
		END AS `LeaveGranted`,	
	NULL, -- LeaveUser
    
	-1, -- rotationAreaPositionId
    'FIXED OFF', -- rotationAreaPosition
    -1, -- rotationAreaId
	'FIXED OFF', -- rotationArea
    -1, -- plannedRotationAreaPositionId
    'FIXED OFF', -- plannedRotationAreaPosition
    -1, -- plannedRotationAreaId
	'FIXED OFF', -- plannedRotationArea
    CAST(false AS JSON), -- nextDay    
	NULL, -- StartTime
    NULL, -- EndTime
    NULL, -- ActualStartTime
    NULL, -- ActualEndTime
    '#999999', -- Colour
    '#ffffff', -- RotationAreaFontColour
    -1, -- Sequence
    NULL -- Notes
FROM AAU.RotationPeriod rp
INNER JOIN AAU.Tally t ON t.Id < 7
INNER JOIN AAU.User u ON LOCATE(WEEKDAY(DATE_ADD(rp.StartDate, INTERVAL t.Id DAY)), u.FixedDayOff) > 0 AND u.fixedDayOff NOT LIKE '[-1]'
LEFT JOIN AAU.LeaveRequest lr 	ON lr.UserId = u.UserId AND DATE_ADD(rp.StartDate, INTERVAL t.Id DAY) BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE RotationPeriodId = prm_RotationPeriodId
AND u.OrganisationId = vOrganisationId
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
						JSON_OBJECT("userId", UserId),
                        JSON_OBJECT("employeeNumber", EmployeeNumber),
                        JSON_OBJECT("userCode", UserCode),
						JSON_OBJECT("rotationUserId", RotationUserId),
						JSON_OBJECT("leaveRequestId", LeaveRequestId),
                        JSON_OBJECT("leaveGranted", LeaveGranted),
                        JSON_OBJECT("leaveUser", LeaveUser),                                               
                        JSON_OBJECT("rotationAreaPositionId", rotationAreaPositionId),
                        JSON_OBJECT("plannedArea", rotationAreaPosition),
                        JSON_OBJECT("rotationAreaId", rotationAreaId),
                        JSON_OBJECT("rotationArea", rotationArea),
                        JSON_OBJECT("nextDay", nextDay),
                        JSON_OBJECT("plannedRotationAreaPositionId", plannedRotationAreaPositionId),
                        JSON_OBJECT("plannedRotationAreaPosition", plannedRotationAreaPosition),
                        JSON_OBJECT("plannedRotationAreaId", plannedRotationAreaId),
                        JSON_OBJECT("plannedRotationArea", plannedRotationArea),                        
                        JSON_OBJECT("plannedStartTime", plannedStartTime),
                        JSON_OBJECT("plannedEndTime", plannedEndTime),                        
						JSON_OBJECT("actualStartTime", actualStartTime),
                        JSON_OBJECT("actualEndTime", actualEndTime),
                        JSON_OBJECT("sequence", Sequence),
                        JSON_OBJECT("rotationAreaColour", rotationAreaColour),
                        JSON_OBJECT("rotationAreaFontColour", rotationAreaFontColour),                        
                        JSON_OBJECT("notes", Notes),
                        JSON_OBJECT("isAdded", CAST(0 AS JSON))
					)
				)
			)
		) AS `RotaDayAssignments`
FROM BaseCTE
GROUP BY RotationPeriodId, RotaDayDate -- Commenting this for the moment as it causes a memory spill to disk
)

SELECT
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("rotationPeriodId", rd.RotationPeriodId),
        JSON_OBJECT("startDate", p.StartDate),
        JSON_OBJECT("endDate", p.EndDate),
        JSON_OBJECT("rotaId", rv.RotaId),
        JSON_OBJECT("rotaVersionId", rv.RotaVersionId),
		JSON_OBJECT("rotaDays", 
			JSON_ARRAYAGG(	
			rd.RotaDayAssignments
			)
		)
	) AS `RotationPeriodAssignments`
FROM rotaDayAssignmentCTE rd
INNER JOIN AAU.RotationPeriod p ON p.RotationPeriodId = rd.RotationPeriodId
INNER JOIN AAU.RotaVersion rv ON rv.RotaVersionId = p.RotaVersionId
GROUP BY rd.RotationPeriodId, p.StartDate, p.EndDate, rv.RotaId, rv.RotaVersionId;

END$$

