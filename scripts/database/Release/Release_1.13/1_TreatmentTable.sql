CREATE TABLE IF NOT EXISTS AAU.Treatment (
  `TreatmentId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `PatientId` INT NOT NULL,
  `TreatmentDateTime` DATETIME NOT NULL,
  `NextTreatmentDateTime` DATETIME NULL,
  `EyeDischargeId` INT NULL,
  `NasalDischargeId` INT NULL,
  `Comment` NVARCHAR(1024) NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TreatmentId`),
  INDEX `FK_TreatmentPatientId_PatientPatientId_idx` (`PatientId` ASC) VISIBLE,
  CONSTRAINT `FK_TreatmentPatientId_PatientPatientId`
    FOREIGN KEY (`PatientId`)
    REFERENCES AAU.Patient (`PatientId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
