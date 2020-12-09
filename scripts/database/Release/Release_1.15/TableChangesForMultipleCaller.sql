/* be careful while running this file so first 
create the emergencycaller table then execute 
the insert statement otherwise all your caller 
data will be break
*/


START TRANSACTION;

DROP TABLE IF EXISTS AAU.EmergencyCaller;
CREATE TABLE AAU.EmergencyCaller (
  `EmergencyCallerId` int NOT NULL AUTO_INCREMENT,
  `EmergencyCaseId` int NOT NULL,
  `CallerId` int NOT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `IsDeleted` tinyint DEFAULT '0',
  `DeletedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`EmergencyCallerId`),
  KEY `FK_EmergencyCaseId_idx` (`EmergencyCaseId`),
  CONSTRAINT `FK_EmergencyCaseId` FOREIGN KEY (`EmergencyCaseId`) REFERENCES AAU.EmergencyCase (`EmergencyCaseId`),
  KEY `FK_CallerId_idx` (`CallerId`),
  CONSTRAINT `FK_CallerId` FOREIGN KEY (`CallerId`) REFERENCES AAU.Caller (`CallerId`)
);

COMMIT;

START TRANSACTION;

INSERT INTO AAU.EmergencyCaller (EmergencyCaseId, CallerId)
SELECT EmergencyCaseId, CallerId
FROM AAU.EmergencyCase;

COMMIT;

ALTER TABLE AAU.EmergencyCase
DROP COLUMN `CallerId`;

