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
		JSON_OBJECT("sameDay", rrss.SameDay),
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
	rr.RotationAreaId,
	ra.RotationArea,
	ra.SortOrder AS `RotationAreaSortOrder`,
	ra.Colour AS `RotationAreaColour`,
	rrss.rotationRoleShiftSegments
	FROM RotationRoleShiftSegmentsCTE rrss
	INNER JOIN AAU.RotationRole rr ON rr.RotationRoleId = rrss.RotationRoleId
	INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rr.RotationAreaId AND ra.IsDeleted = 0
),

BaseCTE AS 
(
SELECT
	rda.RotationPeriodId,
	rda.RotaDayDate,
	rda.RotaDayId,
	IF(lr.Granted = 1 AND rda.UserId = rda.RotationUserId, NULL, rda.UserId) AS 'UserId',
	rda.RotationUserId,
	lr.LeaveRequestId,
    CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
    WHEN lr.Granted = 0 THEN 'Denied'
    WHEN lr.Granted = 1 THEN 'Granted'
    WHEN lr.Granted = 2 THEN 'Partially'
    ELSE NULL
    END AS `LeaveGranted`,
    CONCAT(lu.EmployeeNumber, ' - ', lu.FirstName) AS `LeaveUser`,
    rr.RotationRoleId,
	rr.RotationRole,
    rr.RotationAreaId,
	rr.RotationArea,
    rr.RotationAreaSortOrder,
    rr.RotationAreaColour,
	rr.rotationRoleShiftSegments,
    rda.Notes
	FROM AAU.RotaDayAssignment rda
	INNER JOIN RoleAndAreaCTE rr ON rr.RotationRoleId = rda.RotationRoleId    
	LEFT JOIN AAU.LeaveRequest lr 				ON lr.UserId = rda.RotationUserId AND rda.RotaDayDate BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
    LEFT JOIN AAU.User lu						ON lu.UserId = lr.UserId
    LEFT JOIN AAU.User u						ON u.UserId = rda.UserId
WHERE rda.RotationPeriodId = prm_RotationPeriodId
      
UNION ALL

-- Now let's add in any leave requests

SELECT 
    rp.RotationPeriodId,
	DATE_ADD(lr.LeaveStartDate, INTERVAL t.Id DAY),
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
    -1,
	'LEAVE',
	-1,
	'Leave',
	-1,
	'#999999',
	
    NULL,
    
	NULL
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
	u.UserId,
	u.UserId,
	lr.LeaveRequestId,
	CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
		WHEN lr.Granted = 0 THEN 'Denied'
		WHEN lr.Granted = 1 THEN 'Granted'
		ELSE NULL
		END AS `LeaveGranted`,	
	NULL,
    -1,
	'FIXED OFF',
	-2,
	'Fixed Off',
	-2,
	'#999999',
	
    NULL,
    
	NULL
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
						JSON_OBJECT("userId", UserId),
						JSON_OBJECT("rotationUserId", RotationUserId),
						JSON_OBJECT("leaveRequestId", LeaveRequestId),
                        JSON_OBJECT("leaveGranted", LeaveGranted),
                        JSON_OBJECT("leaveUser", LeaveUser),
                        JSON_OBJECT("rotationRoleId", RotationRoleId),
                        JSON_OBJECT("rotationRole", RotationRole),
                        JSON_OBJECT("rotationAreaId", RotationAreaId),
                        JSON_OBJECT("rotationArea", RotationArea),
                        JSON_OBJECT("rotationAreaColour", RotationAreaColour),
                        JSON_OBJECT("rotationAreaSortOrder", RotationAreaSortOrder),
                        JSON_OBJECT("rotationRoleShiftSegments", rotationRoleShiftSegments),
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

