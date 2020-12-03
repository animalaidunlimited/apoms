
DELIMITER !!
DROP TABLE IF EXISTS AAU.StreetTreatCase!!

DELIMITER $$

CREATE TABLE AAU.StreetTreatCase (
  `StreetTreatCaseId` int(11) NOT NULL AUTO_INCREMENT,
  `PriorityId` int(11) DEFAULT NULL,
  `StatusId` int(11) DEFAULT NULL,
  `TeamId` int(11) DEFAULT NULL,
  `MainProblemId` int(11) DEFAULT NULL,
  `AdminComments` text,
  `OperatorNotes` text,
  `ClosedDate` date DEFAULT NULL,
  `EarlyReleaseFlag` tinyint(1) DEFAULT NULL,
  `IsDeleted` tinyint(1) DEFAULT '0',
  `PatientId` int(11) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `DeletedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`StreetTreatCaseId`),
  KEY `FK_PriorityId_PriorityPriorityId_idx` (`PriorityId`),
  KEY `FK_TeamId_TeamTeamId_idx` (`TeamId`),
  KEY `FK_MainProblemId_MainProblemMainProblemId_idx` (`MainProblemId`),
  KEY `FK_PatientId_PatientPatientId_idx` (`PatientId`),
  KEY `FK_StatusId_StatusId_idx` (`StatusId`),
  CONSTRAINT `FK_MainProblemId_MainProblemMainProblemId` FOREIGN KEY (`MainProblemId`) REFERENCES `mainproblem` (`mainproblemid`),
  CONSTRAINT `FK_StreetTreatCasePatientId_PatientPatientId` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`patientid`),
  CONSTRAINT `FK_StreetTreatCasePriorityId_PriorityPriorityId` FOREIGN KEY (`PriorityId`) REFERENCES `priority` (`priorityid`),
  CONSTRAINT `FK_StreetTreatCaseStatusId_StatusId` FOREIGN KEY (`StatusId`) REFERENCES `status` (`statusid`),
  CONSTRAINT `FK_StreetTreatCaseTeamId_TeamTeamId` FOREIGN KEY (`TeamId`) REFERENCES `team` (`teamid`)
)$$
