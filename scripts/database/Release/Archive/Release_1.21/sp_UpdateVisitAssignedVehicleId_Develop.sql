DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitAssignedVehicleId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVisitAssignedVehicleId(
	IN prm_StreetTreatCaseId INT,
    IN prm_AssignedVehicleId INT
)
BEGIN
/*

Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Update Visit AssignedVehicle.

*/
DECLARE vStreetTreatCaseIdExists INT;
DECLARE vSuccess INT;

SELECT COUNT(1) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE StreetTreatCaseId = prm_StreetTreatCaseId;

IF vStreetTreatCaseIdExists > 0 THEN

	UPDATE AAU.StreetTreatCase
	SET
	AssignedVehicleId = prm_AssignedVehicleId
	WHERE StreetTreatCaseId = prm_StreetTreatCaseId;
    SELECT 1 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END$$
DELIMITER ;
