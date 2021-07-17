DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleShift!!

DELIMITER $$

-- CALL AAU.sp_InsertVehicleShift('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_InsertVehicleShift(IN prm_Username VARCHAR(45), IN prm_VehicleShiftId INT, IN prm_VehicleId INT, IN prm_StartDate DATETIME, IN prm_EndDate DATETIME ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to insert a new shift for a vehicle
*/

DECLARE vOrganisationId INT;
DECLARE vVehicleShiftIdCount INT;
DECLARE vSuccess INT;

SET vSuccess = 0;
SET vVehicleShiftIdCount = 0;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vVehicleShiftIdCount FROM AAU.VehicleShift WHERE VehicleShiftId = prm_VehicleShiftId;

IF vVehicleShiftIdCount = 0 THEN

INSERT INTO AAU.VehicleShift (
		OrganisationId,
		VehicleId,
		StartDate,
		EndDate
	)
	VALUES (
		vOrganisationId,
		prm_VehicleId,
		prm_StartDate,
		prm_EndDate
	);
    
    SELECT LAST_INSERT_ID() INTO prm_VehicleShiftId;
    SELECT 1 INTO vSuccess;
    
ELSE
    SELECT 0 INTO vSuccess;
END IF;
    
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';

END$$