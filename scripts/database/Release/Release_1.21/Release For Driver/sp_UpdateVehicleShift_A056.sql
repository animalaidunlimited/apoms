DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleShift!!

DELIMITER $$

-- CALL AAU.sp_UpdateVehicleShift('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_UpdateVehicleShift(IN prm_Username VARCHAR(45),
IN prm_VehicleShiftId INT,
IN prm_VehicleId INT,
IN prm_StartDate DATETIME,
IN prm_EndDate DATETIME,
IN prm_IsDeleted TINYINT) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to update an existing shift for a vehicle
*/

DECLARE vOrganisationId INT;
DECLARE vVehicleShiftId INT;
DECLARE vVehicleShiftIdCount INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vVehicleShiftId FROM AAU.VehicleShift WHERE VehicleShiftId = prm_VehicleShiftId;

IF vVehicleShiftId = 1 THEN

UPDATE AAU.VehicleShift SET
		OrganisationId = vOrganisationId,
		VehicleId = prm_VehicleId,
		StartDate = prm_StartDate,
		EndDate = prm_EndDate,
        UpdateDate = NOW(),
        IsDeleted = prm_IsDeleted,
        DeletedDate = IF(prm_IsDeleted = 1, NOW(), NULL)
	WHERE VehicleShiftId = prm_VehicleShiftId;
    
    SELECT 1 INTO vSuccess;
    
ELSE
    SELECT 0 INTO vSuccess;
END IF;
    
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';

END$$
