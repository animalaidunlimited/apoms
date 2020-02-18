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

-- -----------------------------------------------------
-- Table `AAU`.`Dispatcher`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Dispatcher` (
  `DispatcherId` INT NOT NULL AUTO_INCREMENT,
  `Dispatcher` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`DispatcherId`))
ENGINE = InnoDB;

INSERT INTO AAU.Dispatcher (Dispatcher) VALUES ("Heera Lal");
INSERT INTO AAU.Dispatcher (Dispatcher) VALUES ("Kalpit");
INSERT INTO AAU.Dispatcher (Dispatcher) VALUES ("Kalu Singh");
INSERT INTO AAU.Dispatcher (Dispatcher) VALUES ("Manoj");
INSERT INTO AAU.Dispatcher (Dispatcher) VALUES ("Prakash");


-- -----------------------------------------------------
-- Table `AAU`.`EmergencyCode`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`EmergencyCode` (
  `EmergencyCodeId` INT NOT NULL AUTO_INCREMENT,
  `EmergencyCode` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`EmergencyCodeId`))
ENGINE = InnoDB;

INSERT INTO `AAU`.`EmergencyCode` (EmergencyCode) VALUES ("Red");
INSERT INTO `AAU`.`EmergencyCode` (EmergencyCode) VALUES ("Green");
INSERT INTO `AAU`.`EmergencyCode` (EmergencyCode) VALUES ("Yellow");


-- -----------------------------------------------------
-- Table `AAU`.`CallOutcome`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`CallOutcome` (
  `CallOutcomeId` INT NOT NULL AUTO_INCREMENT,
  `CallOutcome` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`CallOutcomeId`))
ENGINE = InnoDB;

INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Admission");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Animal died (complainer informed)");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Animal good (rescue not needed)");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Animal gone (complainer informed)");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Animal taken to polyclinic or zoo");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Animal treated on site");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Complainer called back (rescue no longer required)");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Complainer not reachable");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Cruelty staff informed - animal not rescued");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Died in ambulance");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Found dead");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Failure to catch");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Medicine given to complainer");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Owner found (rescue no longer required)");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Rescued/resolved");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Same as");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Staff can't find animal");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Street treatment approved by ST manager");
INSERT INTO AAU.CallOutcome (CallOutcome) VALUE ("Third party rescue");


-- -----------------------------------------------------
-- Table `AAU`.`Complainer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Complainer` (
  `ComplainerId` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(45) NOT NULL,
  `PreferredName` VARCHAR(45) NULL,
  `Number` VARCHAR(45) NOT NULL,
  `AlternateNumber` VARCHAR(45) NULL,
  `Email` VARCHAR(45) NULL,
  `Address` VARCHAR(128) NULL,
  PRIMARY KEY (`ComplainerId`),
  INDEX `IX_Complainer_Phone` (`Number` ASC) INVISIBLE,
  INDEX `IX_Complainer_Name` (`Name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `AAU`.`Rescuer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Rescuer` (
  `RescuerId` INT NOT NULL AUTO_INCREMENT,
  `Rescuer` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`RescuerId`))
ENGINE = InnoDB;

INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Baghat Singh");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Jagdish");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Kalu Singh");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Laxman Singh");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Kamlesh");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Devi Singh");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Self");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Nandu");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Ganpat");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Sanjay");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Mahender");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Pushkar");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Vinod");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Deendeyal");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Heera");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Dharmendra");
INSERT INTO AAU.Rescuer (Rescuer) VALUES ("Kamlesh");


-- -----------------------------------------------------
-- Table `AAU`.`EmergencyCase`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`EmergencyCase` (
  `EmergencyCaseId` INT NOT NULL AUTO_INCREMENT,
  `EmergencyNumber` INT NOT NULL,
  `CallDateTime` DATETIME NOT NULL,
  `DispatcherId` INT NOT NULL,
  `EmergencyCodeId` INT NOT NULL,
  `ComplainerId` INT NOT NULL,
  `CallOutcomeId` INT NULL,
  `Location` VARCHAR(45) NOT NULL,
  `Latitude` DECIMAL(11,8) NOT NULL,
  `Longitude` DECIMAL(11,8) NOT NULL,
  `Rescuer1Id` INT NULL,
  `Rescuer2Id` INT NULL,
  `AmbulanceArrivalTime` DATETIME NULL,
  `RescueTime` DATETIME NULL,
  `AdmissionTime` DATETIME NULL,
  PRIMARY KEY (`EmergencyCaseId`),
  UNIQUE INDEX `EmergencyNumber_UNIQUE` (`EmergencyNumber` ASC) VISIBLE,
  INDEX `DK_EmergencyCaseDispatcherId_DispatcherDispatcherId_idx` (`DispatcherId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseEmergencyCodeId_EmergencyCodeEmergencyCodeI_idx` (`EmergencyCodeId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseCallOutcomeId_CaseOutcomeCaseOutcomeId_idx` (`CallOutcomeId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseComplainerId_ComplainerComplainerId_idx` (`ComplainerId` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseRescuer1_RescuerRescuerId_idx` (`Rescuer1Id` ASC) VISIBLE,
  INDEX `FK_EmergencyCaseRescuer2_RescuerRescuerId_idx` (`Rescuer2Id` ASC) VISIBLE,
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
  CONSTRAINT `FK_EmergencyCaseComplainerId_ComplainerComplainerId`
    FOREIGN KEY (`ComplainerId`)
    REFERENCES `AAU`.`Complainer` (`ComplainerId`)
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
  `AnimalType` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`AnimalTypeId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `AAU`.`Animal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`Animal` (
  `AnimalId` INT NOT NULL AUTO_INCREMENT,
  `EmergencyCaseId` INT NOT NULL,
  `Position` INT NOT NULL,
  `AnimalTypeId` INT NOT NULL,
  `TagNumber` VARCHAR(5) NULL,
  PRIMARY KEY (`AnimalId`),
  INDEX `FK_AnimalEmergencyCaseId_EmergencyCaseEmeregncyCaseId_idx` (`EmergencyCaseId` ASC) VISIBLE,
  INDEX `FK_AnimalAnimalTypeId_AnimalTypeAnimalTypeId_idx` (`AnimalTypeId` ASC) VISIBLE,
  CONSTRAINT `FK_AnimalEmergencyCaseId_EmergencyCaseEmeregncyCaseId`
    FOREIGN KEY (`EmergencyCaseId`)
    REFERENCES `AAU`.`EmergencyCase` (`EmergencyCaseId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_AnimalAnimalTypeId_AnimalTypeAnimalTypeId`
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
  `Problem` VARCHAR(45) NOT NULL,
  `ProblemStripped` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ProblemId`))
ENGINE = InnoDB;

INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Abnormal behaviour","AbnormalBehaviour");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Abnormal walking","AbnormalWalking");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Abnormal behaviour biting","AbnormalBehaviourBiting");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Anorexia","Anorexia");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Blind","Blind");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Can't fly","Cantfly");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Circling","Circling");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Cruelty","Cruelty");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Diarrhea","Diarrhea");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Dull/weakness","DullWeakness");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Ear problem","Earproblem");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Eye problem","Eyeproblem");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("For ABC","ForABC");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Horn/hoof problem","HornHoofproblem");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Item tied/stuck on body","ItemTiedStuckonBody");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Leg problem","Legproblem");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Mouth open","MouthOpen");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Normal behaviour - biting","NormalBehaviour-Biting");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Nose bleeding","NoseBleeding");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Orphan","Orphan");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Penis coming out","PenisComingOut");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Pregnancy problem","Pregnancyproblem");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Shifted puppies","Shiftedpuppies");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Recumbent","Recumbent");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Respiratory","Respiratory");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Rectal prolapse","RectalProlapse");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Salivating/foaming","SalivatingFoaming");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Seizure","Seizure");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Skin problem","Skinproblem");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Stomach problem/collic","StomachproblemCollic");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Stuck/trapped","StuckTrapped");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Swelling other than leg/abdominal swelling","SwellingotherthanLegAbdominalSwelling");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Tick/flea infestation","TickFleaInfestation");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Tumor","Tumor");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Twitching","Twitching");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Very skinny","Veryskinny");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Vaginal/penis discharge/bleeding","VaginalPenisDischargeBleeding");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Vomiting","Vomiting");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Vaginal prolapse","VaginalProlapse");
INSERT INTO AAU.Problem (Problem, ProblemStripped) VALUES ("Wound","Wound");

-- -----------------------------------------------------
-- Table `AAU`.`AnimalProblem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AAU`.`AnimalProblem` (
  `AnimalId` INT NOT NULL,
  `ProblemId` INT NOT NULL,
  PRIMARY KEY (`AnimalId`, `ProblemId`),
  INDEX `FK_AnimalProblemProblemId_ProblemProblemId_idx` (`ProblemId` ASC) VISIBLE,
  CONSTRAINT `FK_AnimalProblemAnimalId_AnimalAnimalId`
    FOREIGN KEY (`AnimalId`)
    REFERENCES `AAU`.`Animal` (`AnimalId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_AnimalProblemProblemId_ProblemProblemId`
    FOREIGN KEY (`ProblemId`)
    REFERENCES `AAU`.`Problem` (`ProblemId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
