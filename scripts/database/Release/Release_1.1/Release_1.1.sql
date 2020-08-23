ALTER TABLE AAU.EmergencyCase 
ADD COLUMN `SameAsEmergencyCaseId` INT NULL AFTER `AdmissionTime`;
ALTER TABLE `AAU`.`EmergencyCase` 
ADD CONSTRAINT `FK_SELF_SameAs`
  FOREIGN KEY (`EmergencyCaseId`)
  REFERENCES `AAU`.`EmergencyCase` (`EmergencyCaseId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;