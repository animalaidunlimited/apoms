DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotaDayAssignmentsByRotationPeriodId !!

-- CALL AAU.sp_GetRotaDayAssignmentsByRotationPeriodId(1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotaDayAssignmentsByRotationPeriodId( IN prm_RotationPeriodId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 13/10/2022
Purpose: Retrieve the rotation period with an array of days, each day containing an array of the assignments

*/

With rotaDayAssignmentCTE AS
(
SELECT rda.RotationPeriodId,
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotaDayDate", rda.RotaDayDate),
			JSON_OBJECT("rotaDayAssignments", 
				JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
						JSON_OBJECT("rotaDayId", rda.RotaDayId),
						JSON_OBJECT("areaShiftId", rda.AreaShiftId),
						JSON_OBJECT("userId", rda.UserID),
						JSON_OBJECT("rotationUserId", rda.RotationUserId),
						JSON_OBJECT("leaveRequestId", rda.LeaveRequestId)
					)
				)
			)
		) AS `RotaDayAssignments`
FROM AAU.RotaDayAssignment rda
	INNER JOIN AAU.RotationPeriod p ON p.RotationPeriodId = rda.RotationPeriodId AND p.IsDeleted = 0
	INNER JOIN AAU.AreaShift a 		ON a.AreaShiftId = rda.AreaShiftId AND a.IsDeleted = 0
	LEFT JOIN AAU.LeaveRequest lr 	ON lr.UserId = rda.RotationUserId AND rda.RotaDayDate BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE p.RotationPeriodId = prm_RotationPeriodId AND
	  rda.IsDeleted = 0 AND
	  a.IsDeleted = 0 AND
	  p.IsDeleted = 0
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

