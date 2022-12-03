START TRANSACTION;

/**********************************

WARNING!!!

WE NEED TO SET THE DEFAULT STREETREATVEHICLE AND WE SHOULD SET THIS TO THE VEHICLE THAT HAS THE MOST CASES! 
THIS SHOULD BE 2, BUT CHECK!!

SELECT AssignedVehicleId, COUNT(1)
FROM AAU.StreetTreatCase stc
GROUP BY AssignedVehicleId;

***********************************/

SET @ST1 = 0;
SET @ST2 = 0;
SET @ST3 = 0;

INSERT INTO AAU.Vehicle
(`OrganisationId`,`VehicleRegistrationNumber`,`VehicleNumber`,`VehicleTypeId`,`LargeAnimalCapacity`,`SmallAnimalCapacity`,`VehicleStatusId`,
`CreatedDate`,`IsDeleted`,`MinRescuerCapacity`,`MaxRescuerCapacity`,`StreetTreatVehicle`) VALUES
(1,'RJ ST1','ST1',3,0,4,1,CURDATE(),0, 1, 3, 1);

SELECT LAST_INSERT_ID() INTO @ST1;

INSERT INTO AAU.Vehicle
(`OrganisationId`,`VehicleRegistrationNumber`,`VehicleNumber`,`VehicleTypeId`,`LargeAnimalCapacity`,`SmallAnimalCapacity`,`VehicleStatusId`,
`CreatedDate`,`IsDeleted`,`MinRescuerCapacity`,`MaxRescuerCapacity`,`StreetTreatVehicle`) VALUES
(1,'RJ ST2','ST2',3,0,4,1,CURDATE(),0, 1, 3, 1);

SELECT LAST_INSERT_ID() INTO @ST2;

INSERT INTO AAU.Vehicle
(`OrganisationId`,`VehicleRegistrationNumber`,`VehicleNumber`,`VehicleTypeId`,`LargeAnimalCapacity`,`SmallAnimalCapacity`,`VehicleStatusId`,
`CreatedDate`,`IsDeleted`,`MinRescuerCapacity`,`MaxRescuerCapacity`,`StreetTreatVehicle`) VALUES
(1,'RJ ST5','ST5',3,0,4,1,CURDATE(),0, 1, 3, 1);

SELECT LAST_INSERT_ID() INTO @ST3;

UPDATE AAU.StreetTreatCase SET AssignedVehicleId = @ST1 WHERE AssignedVehicleId = ;
UPDATE AAU.StreetTreatCase SET AssignedVehicleId = @ST2 WHERE AssignedVehicleId = ;
UPDATE AAU.StreetTreatCase SET AssignedVehicleId = @ST2 WHERE AssignedVehicleId = ;

UPDATE AAU.StreetTreatCase st
INNER JOIN AAU.Patient p ON p.PatientId = st.PatientId
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
SET st.AmbulanceAssignmentTime = ec.CallDateTime
WHERE st.AmbulanceAssignmentTime IS NULL;

ALTER TABLE `AAU`.`StreetTreatCase`
ADD CONSTRAINT `FK_StreetTreatCaseVehicleId_VehicleVehicleId`
  FOREIGN KEY (`AssignedVehicleId`)
  REFERENCES `AAU`.`Vehicle` (`VehicleId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
  
  
  
-- COMMIT

