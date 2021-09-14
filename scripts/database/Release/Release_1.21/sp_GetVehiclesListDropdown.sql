DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleListDropdown!!

-- CALL AAU.p_GetVehiclesListDropdown('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleListDropdown(IN prm_Username VARCHAR(65))
BEGIN

/* 
Created By: Arpit Trivedi
CreatedDate: 07/06/2021
Purpose: To get the list of vehicle for dropdown

Modified By: Jim Mackenzie
Modified On: 2021/07/04
Purpose: Adding current rescuers to the ambulance name
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId
FROM AAU.User
WHERE UserName = prm_Username LIMIT 1;

SELECT
v.VehicleId AS vehicleId,
v.VehicleRegistrationNumber AS vehicleRegistrationNumber,
CONCAT(v.VehicleNumber, IFNULL(vsu.VehicleStaff,' UNK')) AS vehicleNumber
FROM AAU.Vehicle v
LEFT JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId AND
NOW() >= vs.StartDate AND
NOW() <= IFNULL(vs.EndDate, NOW())
LEFT JOIN
(
SELECT VehicleShiftId, CONCAT(" - (",GROUP_CONCAT(IFNULL(u.Initials,"UNK")),")") AS VehicleStaff
FROM AAU.VehicleShiftUser vsu
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
GROUP BY VehicleShiftId
) vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
WHERE v.OrganisationId = vOrganisationId;

END$$

