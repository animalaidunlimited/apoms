

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientDetailsbyArea!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPatientDetailsbyArea(IN prm_Username VARCHAR(45),
												IN prm_Area VARCHAR(45))

BEGIN

DECLARE IsCensusArea BOOLEAN;
SET IsCensusArea = TRUE;

DROP TEMPORARY TABLE IF EXISTS AnimalTypeIds;

CREATE TEMPORARY TABLE IF NOT EXISTS AnimalTypeIds
(
AnimalTypeId INTEGER,
AnimalType VARCHAR(64)
);

IF prm_Area IN ('Shelter Dogs','Upper Handi Heaven','A-Kennel','Handi Heaven','B-Kennel','Isolation','ABC Centre','Pre-Isolation','Puppy','Blind Dogs') THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Dog' , 'Puppy');

SET IsCensusArea = FALSE;

ELSEIF prm_Area = 'Cat area' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Cat' , 'Kitten');

ELSEIF prm_Area = 'Large Animal Hospital' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Bull' , 'Calf' , 'Cow' , 'Donkey' , 'Buffalo' , 'Buffalo Calf' , 'Camel' , 'Horse');

ELSEIF prm_Area = 'Sheep area' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Sheep' , 'Goat' , 'Tortoise');

ELSEIF prm_Area = 'Bird treatment area' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Bird' , 'Chicken' , 'Parrot' , 'Pigeon' , 'Sparrow');

ELSE

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType NOT IN ('Cat' , 'Kitten', 'Bull' , 'Calf' , 'Cow' , 'Donkey' , 'Buffalo' , 'Buffalo Calf' , 'Camel' , 'Horse', 'Goat' , 'Sheep' , 'Goat' , 'Tortoise', 'Bird' , 'Chicken' , 'Parrot' , 'Pigeon' , 'Sparrow');

END IF;

IF IsCensusArea = TRUE THEN

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencynumber" , ec.EmergencyNumber),
JSON_OBJECT("tagnumber" , p.TagNumber),
JSON_OBJECT("species" , aty.AnimalType),
JSON_OBJECT("callername" , c.Name),
JSON_OBJECT("number" , c.Number),
JSON_OBJECT("calldate" , DATE_Format(ec.CallDatetime,"%Y-%m-%d")),
JSON_OBJECT("treatmentPriority", p.TreatmentPriority),
JSON_OBJECT("abcStatus", p.ABCStatus),
JSON_OBJECT("releaseStatus", p.ReleaseStatus),
JSON_OBJECT("temperament", p.Temperament),
JSON_OBJECT("releaseReady", CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN TRUE ELSE FALSE END)
))patientDetails
FROM AAU.Patient p
INNER JOIN AnimalTypeIds aty ON aty.AnimalTypeId = p.AnimalTypeId AND p.PatientStatusId = 1
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId;

ELSE

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencynumber" , ec.EmergencyNumber),
JSON_OBJECT("tagnumber" , p.TagNumber),
JSON_OBJECT("species" , aty.AnimalType),
JSON_OBJECT("callername" , c.Name),
JSON_OBJECT("number" , c.Number),
JSON_OBJECT("calldate" , DATE_Format(ec.CallDatetime,"%Y-%m-%d")),
JSON_OBJECT("treatmentPriority", p.TreatmentPriority),
JSON_OBJECT("abcStatus", p.ABCStatus),
JSON_OBJECT("releaseStatus", p.ReleaseStatus),
JSON_OBJECT("temperament", p.Temperament),
JSON_OBJECT("releaseReady", CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END)
))patientDetails
FROM AAU.Patient p
INNER JOIN AnimalTypeIds aty ON aty.AnimalTypeId = p.AnimalTypeId AND p.PatientStatusId = 1
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
WHERE p.PatientId IN
(
SELECT c.PatientId  
	FROM AAU.Census c
	INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId  
	INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
	INNER JOIN  
	(  
		SELECT TagNumber, MAX(LatestCount) AS MaxLatestCount  
		FROM AAU.Census c  
		INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
		WHERE SortAction IN (1,3)  
		GROUP BY TagNumber  
	) maxAction ON maxAction.TagNumber = c.TagNumber 
    AND maxAction.MaxLatestCount = c.LatestCount
    AND ca.Area = prm_Area
);

END IF;



END$$
        
       -- CALL AAU.sp_GetPatientDetailsbyArea2('Jim','Isolation')
     /*
SELECT *
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
WHERE P.AnimalTypeId IN (7,18,11)
AND p.PatientStatusId = 1
         
         */