CREATE TABLE IF NOT EXISTS AAU.DriverViewQuestions (
  `QustionId` INT NOT NULL AUTO_INCREMENT,
  `ActionStatusId` INT NULL,
  `ActionStatus` VARCHAR(45) NULL,
  `InputType` VARCHAR(45) NULL,
  `SortOrder` INT NULL,
  PRIMARY KEY (`QustionId`));




ALTER TABLE `aau`.`driverviewquestions` 
ADD COLUMN `FormControlType` VARCHAR(45) NULL AFTER `FormControlName`,
CHANGE COLUMN `InputType` `FormControlName` VARCHAR(45) NULL DEFAULT NULL ;


ALTER TABLE `aau`.`driverviewquestions` 
ADD COLUMN `SubAction` VARCHAR(45) NULL AFTER `ActionStatus`;



INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Arrived', 'ambulanceArrivalTime', 'datetime-local', '1');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Rescued', 'rescueTime', 'datetime-local', '2');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Admitted', 'admissionTime', 'datetime-local', '3');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('2', 'Release', 'PickedUp', 'releasePickupDate', 'datetime-local', '1');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('2', 'Release', 'Arrived', 'releaseBeginDate', 'datetime-local', '2');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('2', 'Release', 'Released', 'releaseEndDate', 'datetime-local', '3');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('3', 'StreetTreat', 'Arrived', 'visitBeginDate', 'datetime-local', '1');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('3', 'StreetTreat', 'Treated', 'visitEndDate', 'datetime-local', '2');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'PickedUp', 'releasePickupDate', 'datetime-local', '1');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Arrived', 'releaseBeginDate', 'datetime-local', '2');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Released', 'releaseEndDate', 'datetime-local', '3');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Treated', 'visitEndDate', 'datetime-local', '4');
INSERT INTO `aau`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Admitted', 'patientCallOutcomeId', 'select', '4');
INSERT INTO `aau`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Admitted', 'inTreatmentAreaId', 'select', '5');


ALTER TABLE `aau`.`driverviewquestions` 
ADD COLUMN `Label` VARCHAR(45) NULL AFTER `SortOrder`;

UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Ambulance arrival time' WHERE (`QustionId` = '1');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Rescue time' WHERE (`QustionId` = '2');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Admission Time' WHERE (`QustionId` = '3');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Pickup date' WHERE (`QustionId` = '4');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Release begin date' WHERE (`QustionId` = '5');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Release end date' WHERE (`QustionId` = '6');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Visit begin date' WHERE (`QustionId` = '7');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Visit end date' WHERE (`QustionId` = '8');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Pickup date' WHERE (`QustionId` = '9');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Release begin date' WHERE (`QustionId` = '10');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Release end date' WHERE (`QustionId` = '11');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Visit end date' WHERE (`QustionId` = '12');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Patient calloutcome' WHERE (`QustionId` = '13');
UPDATE `aau`.`DriverViewQuestions` SET `Label` = 'Treatment area' WHERE (`QustionId` = '14');


ALTER TABLE `aau`.`driverviewquestions` 
ADD COLUMN `SelectFunctionname` VARCHAR(45) NULL AFTER `Label`,
ADD COLUMN `IdName` VARCHAR(45) NULL AFTER `SelectFunctionName`,
ADD COLUMN `ValueName` VARCHAR(45) NULL AFTER `IdName`;


UPDATE `aau`.`DriverViewQuestions` SET `SelectFunctionName` = 'getCallOutcomes', `IdName` = 'CallOutcomeId', `ValueName` = 'CallOutcome' WHERE (`QustionId` = '13');
UPDATE `aau`.`DriverViewQuestions` SET `SelectFunctionName` = 'getTreatmentAreas()', `IdName` = 'areaId', `ValueName` = 'areaName' WHERE (`QustionId` = '14');

