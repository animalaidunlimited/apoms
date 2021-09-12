CREATE TABLE IF NOT EXISTS AAU.DriverViewQuestions (
  `QustionId` INT NOT NULL AUTO_INCREMENT,
  `ActionStatusId` INT NULL,
  `ActionStatus` VARCHAR(45) NULL,
  `SubAction` VARCHAR(45),
  `FormControlName` VARCHAR(45) NULL,
  `FormControlType` VARCHAR(45),
  `SortOrder` INT NULL,
  `Label` VARCHAR(45),
  PRIMARY KEY (`QustionId`));




INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Arrived', 'ambulanceArrivalTime', 'datetime-local', '1');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Rescued', 'rescueTime', 'datetime-local', '2');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Admitted', 'admissionTime', 'datetime-local', '3');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('2', 'Release', 'PickedUp', 'releasePickupDate', 'datetime-local', '1');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('2', 'Release', 'Arrived', 'releaseBeginDate', 'datetime-local', '2');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('2', 'Release', 'Released', 'releaseEndDate', 'datetime-local', '3');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('3', 'StreetTreat', 'Arrived', 'visitBeginDate', 'datetime-local', '1');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('3', 'StreetTreat', 'Treated', 'visitEndDate', 'datetime-local', '2');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'PickedUp', 'releasePickupDate', 'datetime-local', '1');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Arrived', 'releaseBeginDate', 'datetime-local', '2');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Released', 'releaseEndDate', 'datetime-local', '3');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('4', 'STRelease', 'Treated', 'visitEndDate', 'datetime-local', '4');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Admitted', 'patientCallOutcomeId', 'select', '4');
INSERT INTO AAU.DriverViewQuestions (`ActionStatusId`, `ActionStatus`, `SubAction`, `FormControlName`, `FormControlType`, `SortOrder`) VALUES ('1', 'Rescue', 'Admitted', 'inTreatmentAreaId', 'select', '5');




UPDATE AAU.DriverViewQuestions SET `Label` = 'Ambulance arrival time' WHERE (`QustionId` = '1');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Rescue time' WHERE (`QustionId` = '2');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Admission Time' WHERE (`QustionId` = '3');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Pickup date' WHERE (`QustionId` = '4');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Release begin date' WHERE (`QustionId` = '5');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Release end date' WHERE (`QustionId` = '6');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Visit begin date' WHERE (`QustionId` = '7');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Visit end date' WHERE (`QustionId` = '8');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Pickup date' WHERE (`QustionId` = '9');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Release begin date' WHERE (`QustionId` = '10');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Release end date' WHERE (`QustionId` = '11');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Visit end date' WHERE (`QustionId` = '12');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Patient calloutcome' WHERE (`QustionId` = '13');
UPDATE AAU.DriverViewQuestions SET `Label` = 'Treatment area' WHERE (`QustionId` = '14');
