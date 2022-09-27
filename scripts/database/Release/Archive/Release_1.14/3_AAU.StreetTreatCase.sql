
DELIMITER !!
DROP TABLE IF EXISTS AAU.StreetTreatCase!!

DELIMITER $$

CREATE TABLE AAU.StreetTreatCase (
  `StreetTreatCaseId` int NOT NULL,
  `PriorityId` int DEFAULT NULL,
  `StatusId` int DEFAULT NULL,
  `TeamId` int DEFAULT NULL,
  `MainProblemId` int DEFAULT NULL,
  `AdminComments` text,
  `OperatorNotes` text,
  `ClosedDate` date DEFAULT NULL,
  `EarlyReleaseFlag` tinyint DEFAULT NULL,
  `IsDeleted` tinyint DEFAULT '0',
  `PatientId` int DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `DeletedDate` datetime DEFAULT NULL,
  KEY `FK_PriorityId_PriorityPriorityId_idx` (`PriorityId`),
  KEY `FK_TeamId_TeamTeamId_idx` (`TeamId`),
  KEY `FK_MainProblemId_MainProblemMainProblemId_idx` (`MainProblemId`),
  KEY `FK_PatientId_PatientPatientId_idx` (`PatientId`),
  KEY `FK_StatusId_StatusId_idx` (`StatusId`),
  CONSTRAINT `FK_MainProblemId_MainProblemMainProblemId` FOREIGN KEY (`MainProblemId`) REFERENCES `MainProblem` (`MainProblemId`),
  CONSTRAINT `FK_StreetTreatCasePatientId_PatientPatientId` FOREIGN KEY (`PatientId`) REFERENCES `Patient` (`PatientId`),
  CONSTRAINT `FK_StreetTreatCasePriorityId_PriorityPriorityId` FOREIGN KEY (`PriorityId`) REFERENCES `Priority` (`PriorityId`),
  CONSTRAINT `FK_StreetTreatCaseStatusId_StatusId` FOREIGN KEY (`StatusId`) REFERENCES `Status` (`StatusId`),
  CONSTRAINT `FK_StreetTreatCaseTeamId_TeamTeamId` FOREIGN KEY (`TeamId`) REFERENCES `Team` (`TeamId`)
)$$
