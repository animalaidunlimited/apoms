DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleListItem !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicle !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVehicle(IN prm_Username VARCHAR(65),
												 IN prm_VehicleId INT,
												 IN prm_VehicleRegistrationNumber VARCHAR(100),
												 IN prm_VehicleNumber VARCHAR(100),
												 IN prm_VehicleTypeId INT,
												 IN prm_LargeAnimalCapacity INT,
												 IN prm_SmallAnimalCapacity INT,
												 IN prm_MinRescuerCapacity INT,
												 IN prm_MaxRescuerCapacity INT,
												 IN prm_VehicleStatusId INT,
												 IN prm_StreetTreatVehicle INT,
												 IN prm_StreetTreatDefaultVehicle INT,
                                                 IN prm_VehicleColour VARCHAR(64),
												 IN prm_VehicleImage VARCHAR(650))
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

SELECT COUNT(1) INTO vVehicleCount FROM AAU.Vehicle
WHERE VehicleId = prm_VehicleId;

IF vVehicleCount = 1 THEN

	IF prm_StreetTreatDefaultVehicle = 1 THEN
    
    UPDATE AAU.Vehicle v
    INNER JOIN AAU.User u ON u.OrganisationId = v.OrganisationId AND u.username = prm_Username
    SET StreetTreatDefaultVehicle = 0;
    
    END IF;

	UPDATE AAU.Vehicle SET
		VehicleRegistrationNumber = prm_VehicleRegistrationNumber,
		VehicleNumber = prm_VehicleNumber,
		VehicletypeId = prm_VehicleTypeId,
		LargeAnimalCapacity = prm_LargeAnimalCapacity,
		SmallAnimalCapacity = prm_SmallAnimalCapacity,
        MinRescuerCapacity = prm_MinRescuerCapacity,
		MaxRescuerCapacity = prm_MaxRescuerCapacity,
		VehicleStatusId = prm_VehicleStatusId,
        StreetTreatVehicle = prm_StreetTreatVehicle,
        StreetTreatDefaultVehicle = prm_StreetTreatDefaultVehicle,
        VehicleColour = prm_VehicleColour,
        VehicleImage = prm_VehicleImage
	WHERE VehicleId = prm_VehicleId;    
   
    SELECT 1 INTO vSuccess;

ELSE 
	
    SELECT 2 INTO vSuccess;
    
END IF;

SELECT prm_VehicleId AS vehicleId, vSuccess AS success;
    

END$$

DELIMITER ;
