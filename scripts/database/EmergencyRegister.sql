-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema AAU
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema AAU
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `AAU` DEFAULT CHARACTER SET utf8 ;
USE `AAU` ;

CREATE TABLE IF NOT EXISTS `AAU`.`Organisation` (
OrganisationId INT  NOT NULL AUTO_INCREMENT,
Organisation VARCHAR(100) NOT NULL
);

INSERT INTO AAU.Organisation (Organisation) VALUES ('Animal Aid Charitable Trust');
INSERT INTO AAU.Organisation (Organisation) VALUES ('Sarvoham');
INSERT INTO AAU.Organisation (Organisation) VALUES ('Helping Hands For Animals');


-- -----------------------------------------------------
-- Table `AAU`.`Dispatcher`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Dispatcher` (
  `DispatcherId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `Dispatcher` VARCHAR(45) NOT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`DispatcherId`),
  INDEX `FK_DispatcherOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_DispatcherOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `Dispatcher_UNIQUE` (`Dispatcher` ASC) VISIBLE)
ENGINE = InnoDB;

INSERT INTO AAU.Dispatcher (OrganisationId, Dispatcher) VALUES (1,"Heera Lal");
INSERT INTO AAU.Dispatcher (OrganisationId, Dispatcher) VALUES (1,"Kalpit");
INSERT INTO AAU.Dispatcher (OrganisationId, Dispatcher) VALUES (1,"Kalu Singh");
INSERT INTO AAU.Dispatcher (OrganisationId, Dispatcher) VALUES (1,"Manoj");
INSERT INTO AAU.Dispatcher (OrganisationId, Dispatcher) VALUES (1,"Prakash");


-- -----------------------------------------------------
-- Table `AAU`.`EmergencyCode`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`EmergencyCode` (
  `EmergencyCodeId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `EmergencyCode` VARCHAR(64) NOT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`EmergencyCodeId`),
  INDEX `FK_EmergencyCodeOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_EmergencyCodeOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `EmergencyCode_UNIQUE` (`EmergencyCode` ASC) VISIBLE)
ENGINE = InnoDB;

INSERT INTO `AAU`.`EmergencyCode` (OrganisationId, EmergencyCode) VALUES (1, "Red");
INSERT INTO `AAU`.`EmergencyCode` (OrganisationId, EmergencyCode) VALUES (1, "Green");
INSERT INTO `AAU`.`EmergencyCode` (OrganisationId, EmergencyCode) VALUES (1, "Yellow");


-- -----------------------------------------------------
-- Table `AAU`.`CallOutcome`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `AAU`.`CallOutcome` (
  `CallOutcomeId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `CallOutcome` VARCHAR(128) NOT NULL,
  PRIMARY KEY (`CallOutcomeId`),
  INDEX `FK_CallOutcomeOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_CallOutcomeOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `CallOutcome_UNIQUE` (`CallOutcome` ASC) VISIBLE)
ENGINE = InnoDB;

INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Admission");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Animal died (Caller informed)");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Animal good (rescue not needed)");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Animal gone (Caller informed)");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Animal taken to polyclinic or zoo");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Animal treated on site");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Caller called back (rescue no longer required)");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Caller not reachable");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Cruelty staff informed - animal not rescued");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Died in ambulance");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Found dead");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Failure to catch");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Medicine given to Caller");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Owner found (rescue no longer required)");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Rescued/resolved");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Same as");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Staff can't find animal");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Street treatment approved by ST manager");
INSERT INTO AAU.CallOutcome (OrganisationId, CallOutcome) VALUE (1, "Third party rescue");


-- -----------------------------------------------------
-- Table `AAU`.`Caller`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Caller` (
  `CallerId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `Name` VARCHAR(45) NOT NULL,
  `PreferredName` VARCHAR(45) NULL,
  `Number` VARCHAR(45) NOT NULL,
  `AlternativeNumber` VARCHAR(45) NULL,
  `Email` VARCHAR(45) NULL,
  `Address` VARCHAR(128) NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`CallerId`),
  INDEX `IX_Caller_Phone` (`Number` ASC) INVISIBLE,
  INDEX `IX_Caller_Name` (`Name` ASC) VISIBLE,
  INDEX `FK_CallOutcomeOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_CallOutcomeOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `Caller_UNIQUE` (`Name` ASC, `Number` ASC) VISIBLE)
ENGINE = InnoDB;

INSERT INTO AAU.Caller (Name, PreferredName, Number, AlternativeNumber, Email, Address) VALUES
('Unknown caller','Unknown caller','',null,'Unknown email','Unknown address');


-- -----------------------------------------------------
-- Table `AAU`.`Rescuer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Rescuer` (
  `RescuerId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `Rescuer` VARCHAR(45) NOT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`RescuerId`),
  INDEX `FK_RescuerOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_RescuerOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `Rescuer_UNIQUE` (`Rescuer` ASC) VISIBLE)
ENGINE = InnoDB;

INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Baghat Singh");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Jagdish");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Kalu Singh");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Laxman Singh");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Kamlesh");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Devi Singh");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Self");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Nandu");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Ganpat");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Sanjay");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Mahender");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Pushkar");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Vinod");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Deendeyal");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Heera");
INSERT INTO AAU.Rescuer (OrganisationId, Rescuer) VALUES (1, "Dharmendra");


-- -----------------------------------------------------
-- Table `AAU`.`EmergencyCase`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`EmergencyCase` (
  `EmergencyCaseId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `EmergencyNumber` INT NOT NULL,
  `CallDateTime` DATETIME NOT NULL,
  `DispatcherId` INT NOT NULL,
  `EmergencyCodeId` INT NOT NULL,
  `CallerId` INT NOT NULL,
  `CallOutcomeId` INT NULL,
  `Location` VARCHAR(512) NOT NULL,
  `Latitude` DECIMAL(11,8) NOT NULL,
  `Longitude` DECIMAL(11,8) NOT NULL,
  `Rescuer1Id` INT NULL,
  `Rescuer2Id` INT NULL,
  `AmbulanceArrivalTime` DATETIME NULL,
  `RescueTime` DATETIME NULL,
  `AdmissionTime` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`EmergencyCaseId`),
  UNIQUE INDEX `EmergencyNumber_UNIQUE` (`EmergencyNumber` ASC) VISIBLE,
  INDEX `DK_EmergencyCaseDispatcherId_DispatcherDispatcherId_idx` (`DispatcherId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseEmergencyCodeId_EmergencyCodeEmergencyCodeI_idx` (`EmergencyCodeId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseCallOutcomeId_CaseOutcomeCaseOutcomeId_idx` (`CallOutcomeId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseCallerId_CallerCallerId_idx` (`CallerId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseRescuer1_RescuerRescuerId_idx` (`Rescuer1Id` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseRescuer2_RescuerRescuerId_idx` (`Rescuer2Id` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_EmergencyCaseOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `Rescuer_UNIQUE` (`Rescuer` ASC) VISIBLE)
  CONSTRAINT `FK_EmergencyCaseDispatcherId_DispatcherDispatcherId`
    FOREIGN KEY (`DispatcherId`)
    REFERENCES `AAU`.`Dispatcher` (`DispatcherId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_EmergencyCaseEmergencyCodeId_EmergencyCodeEmergencyCodeId`
    FOREIGN KEY (`EmergencyCodeId`)
    REFERENCES `AAU`.`EmergencyCode` (`EmergencyCodeId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_EmergencyCaseCallOutcomeId_CaseOutcomeCaseOutcomeId`
    FOREIGN KEY (`CallOutcomeId`)
    REFERENCES `AAU`.`CallOutcome` (`CallOutcomeId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_EmergencyCaseCallerId_CallerCallerId`
    FOREIGN KEY (`CallerId`)
    REFERENCES `AAU`.`Caller` (`CallerId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_EmergencyCaseRescuer1_RescuerRescuerId`
    FOREIGN KEY (`Rescuer1Id`)
    REFERENCES `AAU`.`Rescuer` (`RescuerId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_EmergencyCaseRescuer2_RescuerRescuerId`
    FOREIGN KEY (`Rescuer2Id`)
    REFERENCES `AAU`.`Rescuer` (`RescuerId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `AAU`.`AnimalType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`AnimalType` (
  `AnimalTypeId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `AnimalType` VARCHAR(45) NOT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`AnimalTypeId`),
  UNIQUE INDEX `AnimalType_UNIQUE` (`AnimalType` ASC) VISIBLE),
  INDEX `FK_AnimalTypeOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_AnimalTypeOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `AAU`.`Animal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Patient` (
  `PatientId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `EmergencyCaseId` INT NOT NULL,
  `Position` INT NOT NULL,
  `AnimalTypeId` INT NOT NULL,
  `TagNumber` VARCHAR(5) NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`PatientId`),
  UNIQUE INDEX `PatientTagNumber_UNIQUE` (`TagNumber` ASC, `OrganisationId` ASC) VISIBLE,
  INDEX `FK_PatientEmergencyCaseId_EmergencyCaseEmeregncyCaseId_idx` (`EmergencyCaseId` ASC) VISIBLE,
  INDEX `FK_PatientAnimalTypeId_AnimalTypeAnimalTypeId_idx` (`AnimalTypeId` ASC) VISIBLE,
  INDEX `FK_PatientOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_PatientOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION,
  CONSTRAINT `FK_PatientEmergencyCaseId_EmergencyCaseEmeregncyCaseId`
    FOREIGN KEY (`EmergencyCaseId`)
    REFERENCES `AAU`.`EmergencyCase` (`EmergencyCaseId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientAnimalTypeId_AnimalTypeAnimalTypeId`
    FOREIGN KEY (`AnimalTypeId`)
    REFERENCES `AAU`.`AnimalType` (`AnimalTypeId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `AAU`.`Problem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Problem` (
  `ProblemId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `Problem` VARCHAR(45) NOT NULL,
  `ProblemStripped` VARCHAR(45) NOT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  `IsDeleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`ProblemId`),
  UNIQUE INDEX `Problem_UNIQUE` (`Problem` ASC) VISIBLE),
  INDEX `FK_ProblemOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_ProblemOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
ENGINE = InnoDB;

INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Abnormal behaviour","AbnormalBehaviour");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Abnormal walking","AbnormalWalking");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Abnormal behaviour biting","AbnormalBehaviourBiting");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Anorexia","Anorexia");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Blind","Blind");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Can't fly","Cantfly");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Circling","Circling");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Cruelty","Cruelty");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Diarrhea","Diarrhea");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Dull/weakness","DullWeakness");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Ear problem","Earproblem");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Eye problem","Eyeproblem");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "For ABC","ForABC");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Horn/hoof problem","HornHoofproblem");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Item tied/stuck on body","ItemTiedStuckonBody");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Leg problem","Legproblem");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Mouth open","MouthOpen");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Normal behaviour - biting","NormalBehaviour-Biting");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Nose bleeding","NoseBleeding");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Orphan","Orphan");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Penis coming out","PenisComingOut");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Pregnancy problem","Pregnancyproblem");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Shifted puppies","Shiftedpuppies");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Recumbent","Recumbent");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Respiratory","Respiratory");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Rectal prolapse","RectalProlapse");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Salivating/foaming","SalivatingFoaming");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Seizure","Seizure");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Skin problem","Skinproblem");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Stomach problem/collic","StomachproblemCollic");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Stuck/trapped","StuckTrapped");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Swelling other than leg/abdominal swelling","SwellingotherthanLegAbdominalSwelling");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Tick/flea infestation","TickFleaInfestation");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Tumor","Tumor");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Twitching","Twitching");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Very skinny","Veryskinny");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Vaginal/penis discharge/bleeding","VaginalPenisDischargeBleeding");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Vomiting","Vomiting");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Vaginal prolapse","VaginalProlapse");
INSERT INTO AAU.Problem (OrganisationId, Problem, ProblemStripped) VALUES (1, "Wound","Wound");

-- -----------------------------------------------------
-- Table `AAU`.`PatientProblem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`PatientProblem` (
  `PatientId` INT NOT NULL,
  `OrganisationId` INT NOT NULL,
  `ProblemId` INT NOT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`PatientId`, `ProblemId`),
  INDEX `FK_PatientProblemProblemId_ProblemProblemId_idx` (`ProblemId` ASC) VISIBLE,
  INDEX `FK_PatientProblemOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_PatientProblemOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION,
  CONSTRAINT `FK_PatientProblemPatientId_PatientPatientId`
    FOREIGN KEY (`PatientId`)
    REFERENCES `AAU`.`Patient` (`PatientId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientProblemProblemId_ProblemProblemId`
    FOREIGN KEY (`ProblemId`)
    REFERENCES `AAU`.`Problem` (`ProblemId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

ALTER TABLE `AAU`.`Logging` 
ADD COLUMN `OrganisationId` INT(11) AFTER `LoggingId`;
UPDATE `AAU`.`Logging` SET OrganisationId = 1 WHERE LoggingId != -1;
ALTER TABLE AAU.Logging ALTER OrganisationId INT NOT NULL;

ALTER TABLE `AAU`.`AnimalType` ADD COLUMN OrganisationId INT AFTER AnimalTypeId;
UPDATE `AAU`.`AnimalType` SET OrganisationId = 1 WHERE AnimalTypeId != -1;
ALTER TABLE `AAU`.`AnimalType` ALTER OrganisationId INT NOT NULL;

ALTER TABLE `AAU`.`User` ADD COLUMN OrganisationId INT AFTER UserId;
UPDATE `AAU`.`User` SET OrganisationId = 1 WHERE UserId != -1;
ALTER TABLE `AAU`.`User` ALTER OrganisationId INT NOT NULL;


ALTER TABLE `AAU`.`User` 
ADD UNIQUE INDEX `UQ_UserName` (`UserName` ASC) VISIBLE;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
