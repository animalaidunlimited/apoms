DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleListItem !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicle !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertVehicle(
												IN prm_Username VARCHAR(65),
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
                                                IN prm_VehicleImage VARCHAR(650)
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
DECLARE vOrganisationId INT;

SELECT COUNT(1) INTO vVehicleCount
FROM AAU.Vehicle
WHERE VehicleNumber = prm_VehicleNumber 
AND VehicleRegistrationNumber = prm_VehicleRegistrationNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username;

IF vVehicleCount = 0 THEN

	IF prm_StreetTreatDefaultVehicle = 1 THEN
    
    UPDATE AAU.Vehicle SET prm_StreetTreatDefaultVehicle = 0 WHERE OrganisationId = vOrganisationId;
    
    END IF;
	
    INSERT INTO AAU.Vehicle (
		VehicleRegistrationNumber,
		VehicleNumber,
		VehicleTypeId,
		LargeAnimalCapacity,
		SmallAnimalCapacity,
        MinRescuerCapacity,
        MaxRescuerCapacity,
		VehicleStatusId,
        StreetTreatVehicle,
        StreetTreatDefaultVehicle,
        VehicleColour,
		OrganisationId,
        VehicleImage
	)
	VALUES(
		prm_VehicleRegistrationNumber,
        prm_VehicleNumber,
        prm_VehicleTypeId,
        prm_LargeAnimalCapacity,
        prm_SmallAnimalCapacity,
        prm_MinRescuerCapacity,
        prm_MaxRescuerCapacity,
        prm_VehicleStatusId,
        prm_StreetTreatVehicle,
        prm_StreetTreatDefaultVehicle,
        prm_VehicleColour,
		vOrganisationId,
        prm_VehicleImage
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
