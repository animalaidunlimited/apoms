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
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('3', 'StreetTreat', 'Treated', 'VisitBeginDate', 'datetime-local', '2');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'PickedUp', 'releasePickupDate', 'datetime-local', '1');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Arrived', 'releaseBeginDate', 'datetime-local', '2');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Released', 'releaseEndDate', 'datetime-local', '3');
INSERT INTO `AAU`.`DriverViewQuestions` (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Treated', 'visitEndDate', 'datetime-local', '4');
