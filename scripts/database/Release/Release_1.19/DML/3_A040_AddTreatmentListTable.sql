CREATE TABLE IF NOT EXISTS `AAU`.`TreatmentList` (
  `TreatmentListId` INT NOT NULL AUTO_INCREMENT,
  `PatientId` INT NOT NULL,
  `Admission` TINYINT NULL,
  `InTreatmentAreaId` INT NOT NULL,
  `InDate` DATETIME NOT NULL,
  `InAccepted` TINYINT NULL,
  `OutTreatmentAreaId` INT NULL,
  `OutDate` DATETIME NULL,
  `OutAccepted` TINYINT NULL,
  `OutOfHospital` TINYINT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TreatmentListId`),
  INDEX `FK_TreatmentListPatientId_PatientPatiendId_idx` (`PatientId` ASC) VISIBLE,
  INDEX `FK_InTreatmentAreaId_TreatmentAreaTreatmentAreaId_idx` (`InTreatmentAreaId` ASC) VISIBLE,
  INDEX `FK_OutTreatmentAreaId_TreatmentAreaTreatmentAreaId_idx` (`OutTreatmentAreaId` ASC) VISIBLE,
  CONSTRAINT `FK_TreatmentListPatientId_PatientPatiendId`
    FOREIGN KEY (`PatientId`)
    REFERENCES `AAU`.`Patient` (`PatientId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_InTreatmentAreaId_TreatmentAreaTreatmentAreaId`
    FOREIGN KEY (`InTreatmentAreaId`)
    REFERENCES `AAU`.`TreatmentArea` (`AreaId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_OutTreatmentAreaId_TreatmentAreaTreatmentAreaId`
    FOREIGN KEY (`OutTreatmentAreaId`)
    REFERENCES `AAU`.`TreatmentArea` (`AreaId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
