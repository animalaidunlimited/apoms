DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleListItem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertVehicleListItem(
												IN prm_Username VARCHAR(65),
												IN prm_VehicleRegistrationNumber VARCHAR(100),
												IN prm_VehicleNumber VARCHAR(100),
												IN prm_VehicleTypeId INT,
												IN prm_LargeAnimalCapacity INT,
												IN prm_SmallAnimalCapacity INT,
                                                IN prm_MinRescuerCapacity INT,
												IN prm_MaxRescuerCapacity INT,
												IN prm_VehicleStatusId INT
                                            )
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate: 18/05/2021
Purpose: To insert the vehicle record
*/

DECLARE	vVehicleCount INT;
DECLARE vSuccess INT;
DECLARE vVehicleId INT;

SELECT COUNT(1) INTO vVehicleCount
FROM AAU.Vehicle
WHERE VehicleNumber = prm_VehicleNumber 
AND VehicleRegistrationNumber = prm_VehicleRegistrationNumber;

IF vVehicleCount = 0 THEN
	
    INSERT INTO AAU.Vehicle (
		VehicleRegistrationNumber,
		VehicleNumber,
		VehicleTypeId,
		LargeAnimalCapacity,
		SmallAnimalCapacity,
        MinRescuerCapacity,
        MaxRescuerCapacity,
		VehicleStatusId
	)
	VALUES(
		prm_VehicleRegistrationNumber,
        prm_VehicleNumber,
        prm_VehicleTypeId,
        prm_LargeAnimalCapacity,
        prm_SmallAnimalCapacity,
        prm_MinRescuerCapacity,
        prm_MaxRescuerCapacity,
        prm_VehicleStatusId
	);
    
	SELECT LAST_INSERT_ID(), 1 INTO vVehicleId, vSuccess;
    
ELSEIF vVehicleCount > 0 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;


END IF; 

SELECT vVehicleId AS vehicleId, vSuccess AS success;
	
END$$

DELIMITER ;
