DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDropdownByAssignmentDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDropdownByAssignmentDate (IN prm_Username VARCHAR(45),
IN prm_AssignmentDate DATETIME)
BEGIN

/*
Created by: Arpit Trivedi
Created Date: 09-09-2021
Purpose: To get the vehicle list by assigned date 
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT vs.VehicleId AS `vehicleId` ,
vs.VehicleShiftId AS `vehicleShiftId`,
CONCAT(v.VehicleNumber,vsu.VehicleStaff) AS `vehicleNumber`,
v.VehicleRegistrationNumber AS `vehicleRegistrationNumber`
FROM AAU.VehicleShift vs
INNER JOIN AAU.Vehicle v ON v.VehicleId = vs.VehicleId
LEFT JOIN
(
	SELECT VehicleShiftId, CONCAT(" - (",GROUP_CONCAT(u.Initials),")") AS `VehicleStaff`
	FROM AAU.VehicleShiftUser vsu
	LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
	GROUP BY VehicleShiftId
) vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
WHERE v.OrganisationId = vOrganisationId
AND prm_AssignmentDate > vs.StartDate AND prm_AssignmentDate < vs.EndDate
AND vs.IsDeleted IS NULL;

END$$
DELIMITER ;
