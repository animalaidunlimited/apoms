DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleListItem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVehicleListItem(IN prm_Username VARCHAR(65),
								 IN prm_VehicleId INT,
								 IN prm_VehicleRegistrationNumber VARCHAR(100),
								 IN prm_VehicleNumber VARCHAR(100),
								 IN prm_VehicleTypeId INT,
								 IN prm_LargeAnimalCapacity INT,
								 IN prm_SmallAnimalCapacity INT,
                                 IN prm_MinRescuerCapacity INT,
                                 IN prm_MaxRescuerCapacity INT,
								 IN prm_VehicleStatusId INT)
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate: 18/05/2021
Purpose: To update the vehicle record
*/

DECLARE vSuccess INT;
DECLARE vVehicleCount INT;

SET vSuccess = 0;
SET vVehicleCount = 0;

SELECT COUNT(1) INTO vVehicleCount FROM AAU.VehicleList
WHERE VehicleId = prm_VehicleId;

IF vVehicleCount = 1 THEN

	UPDATE AAU.VehicleList SET
		VehicleRegistrationNumber = prm_VehicleRegistrationNumber,
		VehicleNumber = prm_VehicleNumber,
		VehicletypeId = prm_VehicleTypeId,
		LargeAnimalCapacity = prm_LargeAnimalCapacity,
		SmallAnimalCapacity = prm_SmallAnimalCapacity,
        MinRescuerCapacity = prm_MinRescuerCapacity,
		MaxRescuerCapacity = prm_MaxRescuerCapacity,
		VehicleStatusId = prm_VehicleStatusId
	WHERE VehicleId = prm_VehicleId;
    
    SELECT 1 INTO vSuccess;

ELSE 
	
    SELECT 2 INTO vSuccess;
    
END IF;

SELECT prm_VehicleId AS vehicleId, vSuccess AS success;
    

END$$
DELIMITER ;
