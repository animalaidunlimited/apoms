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
	rda.UserID,
	rda.RotationUserId,
	rda.LeaveRequestId,
	rr.RotationRole,
    ra.RotationAreaId,
	ra.RotationArea,
    ra.SortOrder AS `RotationAreaSortOrder`,
    ra.Colour AS `RotationAreaColour`,
	TIME_FORMAT(rr.StartTime, '%h:%i %p') AS StartTime,
	TIME_FORMAT(rr.EndTime, '%h:%i %p') AS EndTime,
	TIME_FORMAT(rda.ActualStartTime, '%h:%i %p') AS ActualStartTime,
	TIME_FORMAT(rda.ActualEndTime, '%h:%i %p') AS ActualEndTime,
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
WHERE p.RotationPeriodId = prm_RotationPeriodId AND
	  rda.IsDeleted = 0 AND
	  a.IsDeleted = 0 AND
	  p.IsDeleted = 0
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
                        JSON_OBJECT("rotationRole", RotationRole),
                        JSON_OBJECT("rotationAreaId", RotationAreaId),
                        JSON_OBJECT("rotationArea", RotationArea),
                        JSON_OBJECT("rotationAreaColour", RotationAreaColour),
                        JSON_OBJECT("rotationAreaSortOrder", RotationAreaSortOrder),
                        JSON_OBJECT("plannedShiftStartTime", StartTime),
                        JSON_OBJECT("plannedShiftEndTime", EndTime),
                        JSON_OBJECT("actualShiftStartTime", ActualStartTime),
                        JSON_OBJECT("actualShiftEndTime", ActualEndTime),
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

