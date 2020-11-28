DELIMITER !!
DROP TABLE  AAU.Streettreatcase;!!

DELIMITER $$
CREATE TABLE AAU.Streettreatcase (
  `StreetTreatCaseId` int NOT NULL AUTO_INCREMENT,
  `PriorityId` int DEFAULT NULL,
  `StatusId` int DEFAULT NULL,
  `TeamId` int DEFAULT NULL,
  `MainProblemId` int DEFAULT NULL,
  `AdminComments` text,
  `OperatorNotes` text,
  `ClosedDate` date DEFAULT NULL,
  `EarlyReleaseFlag` tinyint(1) DEFAULT NULL,
  `IsDeleted` tinyint(1) DEFAULT '0',
  `PatientId` int DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `DeletedDate` datetime DEFAULT 0,
PRIMARY KEY (`StreetTreatCaseId`));$$