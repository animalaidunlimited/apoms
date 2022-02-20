START TRANSACTION;

/**********************************

WARNING!!!

NEED TO SET THE Ids FOR STREETTREAT TEAMS

***********************************/

SET @ST1 = 0;
SET @ST2 = 0;
SET @ST3 = 0;

INSERT INTO AAU.Vehicle
(`OrganisationId`,`VehicleRegistrationNumber`,`VehicleNumber`,`VehicleTypeId`,`LargeAnimalCapacity`,`SmallAnimalCapacity`,`VehicleStatusId`,
`CreatedDate`,`IsDeleted`,`MinRescuerCapacity`,`MaxRescuerCapacity`) VALUES
(1,'RJ ST1','ST1',3,0,4,1,CURDATE(),0, 1, 3);

SELECT LAST_INSERT_ID() INTO @ST1;

INSERT INTO AAU.Vehicle
(`OrganisationId`,`VehicleRegistrationNumber`,`VehicleNumber`,`VehicleTypeId`,`LargeAnimalCapacity`,`SmallAnimalCapacity`,`VehicleStatusId`,
`CreatedDate`,`IsDeleted`,`MinRescuerCapacity`,`MaxRescuerCapacity`) VALUES
(1,'RJ ST2','ST2',3,0,4,1,CURDATE(),0, 1, 3);

SELECT LAST_INSERT_ID() INTO @ST2;

INSERT INTO AAU.Vehicle
(`OrganisationId`,`VehicleRegistrationNumber`,`VehicleNumber`,`VehicleTypeId`,`LargeAnimalCapacity`,`SmallAnimalCapacity`,`VehicleStatusId`,
`CreatedDate`,`IsDeleted`,`MinRescuerCapacity`,`MaxRescuerCapacity`) VALUES
(1,'RJ ST5','ST5',3,0,4,1,CURDATE(),0, 1, 3);

SELECT LAST_INSERT_ID() INTO @ST3;

UPDATE AAU.StreetTreatCase SET AssignedVehicleId = @ST1 WHERE AssignedVehicleId = 1;
UPDATE AAU.StreetTreatCase SET AssignedVehicleId = @ST2 WHERE AssignedVehicleId = 2;
UPDATE AAU.StreetTreatCase SET AssignedVehicleId = @ST2 WHERE AssignedVehicleId = 3;

ALTER TABLE `AAU`.`StreetTreatCase`
ADD CONSTRAINT `FK_StreetTreatCaseVehicleId_VehicleVehicleId`
  FOREIGN KEY (`AssignedVehicleId`)
  REFERENCES `AAU`.`Vehicle` (`VehicleId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
-- COMMIT

