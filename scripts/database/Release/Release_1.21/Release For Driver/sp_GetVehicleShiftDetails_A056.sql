DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleShiftDetails !!

DELIMITER $$

-- CALL AAU.sp_GetVehicleShiftDetails('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_GetVehicleShiftDetails(IN prm_Username VARCHAR(45), IN prm_ShiftDate DATE ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to bring back the details of shifts by vehicle
*/

WITH ShiftCTE AS
(
SELECT
vs.VehicleShiftId,
JSON_OBJECT(
"vehicleId", vs.VehicleId,
"vehicleShiftId", vs.VehicleShiftId,
"shiftStartTime", DATE_FORMAT(vs.StartDate, "%Y-%m-%dT%H:%i:%s"),
"shiftEndTime", DATE_FORMAT(vs.EndDate, "%Y-%m-%dT%H:%i:%s"),
"isDeleted", vs.IsDeleted) AS `shiftDetails`

FROM AAU.VehicleShift vs
WHERE prm_ShiftDate BETWEEN CAST(vs.StartDate AS DATE) AND CAST(IFNULL(vs.EndDate, NOW()) AS DATE)
AND IFNULL(vs.IsDeleted,0) = 0
),
UserCTE AS
(
SELECT	vsu.VehicleShiftId,
		JSON_ARRAYAGG(
		JSON_OBJECT("userId", u.UserId,
		"firstName", u.FirstName,
		"surname", u.Surname,
		"initials", u.Initials,
		"colour", u.Colour)) AS `userDetails`
FROM AAU.VehicleShiftUser vsu
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vsu.VehicleShiftId IN (SELECT VehicleShiftId FROM ShiftCTE)
AND IFNULL(vsu.IsDeleted,0) = 0
GROUP BY vsu.VehicleShiftId
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
s.shiftDetails,
JSON_OBJECT("vehicleStaff", u.userDetails)
)) AS `vehicleShiftDetails`
FROM ShiftCTE s
LEFT JOIN UserCTE u ON u.VehicleShiftId = s.VehicleShiftId;

END$$
