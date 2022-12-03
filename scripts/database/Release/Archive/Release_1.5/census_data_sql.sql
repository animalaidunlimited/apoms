-- Create table CensusArea -- 

DROP TABLE IF EXISTS AAU.CensusArea;
CREATE TABLE AAU.CensusArea(
  `AreaId` int NOT NULL AUTO_INCREMENT,
  `OrganisationId` int NOT NULL,
  `Area` varchar(100) NOT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `SortArea` int DEFAULT NULL,
  `IsDeleted` tinyint DEFAULT NULL,
  `DeletedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`AreaId`),
  KEY `FK_CensusAreaOrganisation_OrganisationOrganisationId_idx` (`OrganisationId`),
  CONSTRAINT `FK_CensusAreaOrganisation_OrganisationOrganisationId` FOREIGN KEY (`OrganisationId`) REFERENCES AAU.Organisation (`OrganisationId`)
);

-- Create table CensusAction -- 

DROP TABLE IF EXISTS AAU.CensusAction;

CREATE TABLE AAU.CensusAction (
  `ActionId` int NOT NULL AUTO_INCREMENT,
  `Action` varchar(45) NOT NULL,
  `SortAction` int DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `IsDeleted` tinyint DEFAULT NULL,
  `DeletedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`ActionId`)
);


-- Create table Census -- 

DROP TABLE IF EXISTS AAU.Census;
CREATE TABLE AAU.Census (
  `CensusId` int NOT NULL AUTO_INCREMENT,
  `AreaId` int NOT NULL,
  `ActionId` int NOT NULL,
  `TagNumber` varchar(45) NOT NULL,
  `ErrorCode` int NOT NULL,
  `CensusDate` date DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CensusId`),
  KEY `FK_CensusAreaId_CensusAreaAreaId_idx` (`AreaId`),
  KEY `FK_CensusActionId_CensusActionActionId_idx` (`ActionId`),
  CONSTRAINT `FK_CensusActionId_CensusActionActionId` FOREIGN KEY (`ActionId`) REFERENCES AAU.CensusAction (`ActionId`),
  CONSTRAINT `FK_CensusAreaId_CensusAreaAreaId` FOREIGN KEY (`AreaId`) REFERENCES AAU.CensusArea (`AreaId`)
);


-- Insert data in census area table --

DELETE FROM AAU.CensusArea WHERE CensusAreaId > -100;
ALTER TABLE AAU.CensusArea AUTO_INCREMENT = 1;


INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 ,'A-Kennel', 1 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 ,'B-Kennel', 2 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Isolation Area' , 3 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Pre-Isolation Area' , 4 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Puppy Area' , 5 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'ABC Centre' , 6 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Shelter Dogs' , 7 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Handi Heaven' , 8 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Blind Dogs' , 9 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Large Animal Hospital' , 10 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'Large Animal Sanctuary' , 11 , 0);
INSERT INTO AAU.CensusArea(OrganisationId , Area , SortArea , IsDeleted) VALUES (1 , 'ABC Shelter Dogs' , 12 , 0);

-- Insert data into censusAction --
DELETE FROM AAU.CensusAction WHERE CensusActionId > -100;
ALTER TABLE AAU.CensusAction AUTO_INCREMENT = 1;

INSERT INTO AAU.CensusAction(Action , SortAction , IsDeleted) VALUES ('Admission' , 1 , 0);
INSERT INTO AAU.CensusAction(Action , SortAction , IsDeleted) VALUES ('Moved Out' , 2 , 0);
INSERT INTO AAU.CensusAction(Action , SortAction , IsDeleted) VALUES ('Moved In' , 3 , 0);



-- Insert data stored proc --

DROP PROCEDURE IF EXISTS AAU.sp_InsertCensusData;

CREATE PROCEDURE AAU.sp_InsertCensusData(
IN prm_Username VARCHAR(128),
IN prm_AreaId INT,
IN prm_ActionId INT,
IN prm_TagNumber VARCHAR(45),
IN prm_Date DATE
)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 07/08/2020
Purpose: Insert data into censusdata Table
*/
DECLARE vCensusCount INT;
DECLARE vPatientId INT;
DECLARE vErrorCode INT;
DECLARE vSuccess INT;
DECLARE vCensusId INT;
SET vErrorCode = 0;
SET vCensusCount = 0;

SELECT COUNT(1) INTO vCensusCount FROM AAU.Census WHERE TagNumber = prm_TagNumber AND AreaId = prm_AreaId AND ActionId = prm_ActionId AND CensusDate = prm_Date;
SELECT PatientId INTO vPatientId FROM AAU.Patient WHERE TagNumber = prm_TagNumber;

IF vPatientId IS NULL THEN
SET vErrorCode = 1;
END IF;


IF vCensusCount = 0 THEN

INSERT INTO AAU.Census(AreaId,ActionId,TagNumber,ErrorCode,CensusDate)
VALUES(
prm_AreaId,
prm_ActionId,
prm_TagNumber,
vErrorCode,
prm_Date);

SELECT LAST_INSERT_ID() INTO vCensusId;
SELECT 1 INTO vSuccess;

ELSEIF vCensusCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vCensusID, vSuccess, vPatientId, vErrorCode;

END;



-- getcensus Stored Proc --

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusObject;

CREATE PROCEDURE AAU.sp_GetCensusObject(IN prm_username Varchar(45),
										IN prm_Date DATE)
BEGIN


/*
Created By: Arpit Trivedi
Created On: 10/08/2020
Purpose: For fetching the census data
*/



SELECT
		JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE( 
		AreaActions.AreaId,
		AreaActions.Area,
		AreaActions.SortArea,
		AreaActions.Actions
)) AS Census
FROM
(
SELECT 
JSON_OBJECT("areaId" , ca.AreaId) AreaId,
JSON_OBJECT("areaName",ca.Area) Area,
JSON_OBJECT("sortArea",ca.SortArea) SortArea,

JSON_OBJECT("actions",
		JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE( 
        JSON_OBJECT("actionId" , ca.ActionId),
		JSON_OBJECT("actionName",ca.Action),
        JSON_OBJECT("sortAction",ca.SortAction),
        JSON_OBJECT("patients", IFNULL(p.PatientRecords , JSON_ARRAY()))
        
        ))) AS Actions
FROM 
(
SELECT AreaId, Area, SortArea, ActionId, Action, SortAction
From AAU.CensusArea ca
CROSS JOIN AAU.CensusAction csa
) ca
LEFT JOIN (
SELECT c.AreaId, c.ActionId, JSON_ARRAYAGG(
        JSON_MERGE_PRESERVE( 
			JSON_OBJECT("patientId" , p.PatientId),
			JSON_OBJECT("tagNumber",c.TagNumber),
            JSON_OBJECT("errorCode" , c.ErrorCode)
        )) as PatientRecords
FROM AAU.Census c
LEFT JOIN AAU.Patient p  ON p.TagNumber = c.TagNumber
WHERE c.CensusDate = prm_Date
GROUP BY c.AreaId, c.ActionId
) p ON p.AreaId = ca.AreaId AND p.ActionId = ca.ActionId
GROUP BY ca.AreaId
) AreaActions;
END;







