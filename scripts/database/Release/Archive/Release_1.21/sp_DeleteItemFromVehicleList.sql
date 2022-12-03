DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeleteItemFromVehicleList !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeleteItemFromVehicleList(IN prm_Username VARCHAR(65),
												IN prm_VehicleId INT)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 19/05/2021
Purpose: To delete vehicle from the vehicleList table.
*/

DECLARE vSuccess INT;
DECLARE vOrganisationId INT;
DECLARE VehicleIdCount INT;

SET VehicleIdCount = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User
WHERE UserName = prm_Username;

SELECT COUNT(1) INTO VehicleIdCount FROM AAU.Vehicle WHERE VehicleId = prm_VehicleId;

IF VehicleIdCount = 1 THEN

	UPDATE AAU.Vehicle SET
	IsDeleted = 1,
	DeletedDate = CURDATE()
	WHERE VehicleId = prm_VehicleId;

	SELECT 1 INTO vSuccess;
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_VehicleId,'VehicleList','Delete', NOW());
 

ELSE 
	SELECT 2 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;


END$$
DELIMITER ;
