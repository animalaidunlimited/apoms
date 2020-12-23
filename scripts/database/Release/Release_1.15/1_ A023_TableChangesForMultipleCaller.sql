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
  `PrimaryCaller` tinyint DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `IsDeleted` tinyint DEFAULT '0',
  `DeletedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`EmergencyCallerId`),
  KEY `FK_EmergencyCaller_EmergencyCaseId_idx` (`EmergencyCaseId`),
  CONSTRAINT `FK_EmergencyCaller_EmergencyCaseId` FOREIGN KEY (`EmergencyCaseId`) REFERENCES AAU.EmergencyCase (`EmergencyCaseId`)
) ;

COMMIT;

START TRANSACTION;

INSERT INTO AAU.EmergencyCaller (EmergencyCaseId, CallerId , PrimaryCaller)
SELECT EmergencyCaseId, CallerId , 1
FROM AAU.EmergencyCase;

COMMIT;

ALTER TABLE `AAU`.`EmergencyCaller` 
ADD CONSTRAINT `FK_EmergencyCallerCallerId_CallerCallerId`
  FOREIGN KEY (`CallerId`) REFERENCES AAU.Caller (CallerId);
  
ALTER TABLE `AAU`.`EmergencyCaller`
ADD INDEX `IX_EmergencyCaseId_IsDeleted_CallerId` (`EmergencyCaseId` ASC, `CallerId` ASC, `IsDeleted` ASC) VISIBLE;

ALTER TABLE AAU.EmergencyCase DROP FOREIGN KEY `FK_EmergencyCaseCallerId_CallerCallerId`;
ALTER TABLE AAU.EmergencyCase DROP INDEX `FK_EmergencyCaseCallerId_CallerCallerId_idx` ;


ALTER TABLE AAU.EmergencyCase
DROP COLUMN `CallerId`;

SELECT * FROM AAU.EmergencyCase LIMIT 1;

