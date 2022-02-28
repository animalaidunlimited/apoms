DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

ALTER TABLE AAU.StreetTreatCase DROP FOREIGN KEY `FK_StreetTreatCaseTeamId_TeamTeamId`;
ALTER TABLE AAU.StreetTreatCase DROP INDEX `TeamId`;

ALTER TABLE AAU.StreetTreatCase CHANGE COLUMN `TeamId` `AssignedVehicleId` INT(11) NULL DEFAULT NULL,
ADD INDEX `FK_StreetTreatCaseVehicleId_VehicleVehicleId_idx` (`AssignedVehicleId` ASC) VISIBLE,
ADD COLUMN `AmbulanceAssignmentTime` DATETIME NULL AFTER `AssignedVehicleId`;

UPDATE AAU.StreetTreatCase SET OrganisationId = 1;
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	
