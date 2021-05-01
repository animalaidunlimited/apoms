DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientDetailsbyArea !!

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

ELSEIF prm_Area = 'Large animal hospital' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Bull' , 'Calf' , 'Cow' , 'Donkey' , 'Buffalo' , 'Buffalo Calf' , 'Camel' , 'Horse');

ELSEIF prm_Area = 'Large Animal Sanctuary' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Bull' , 'Calf' , 'Cow' , 'Donkey' , 'Buffalo' , 'Buffalo Calf' , 'Camel' , 'Horse');

SET IsCensusArea = FALSE;

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
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , DATE_Format(ec.CallDatetime,"%Y-%m-%d")),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Release ready", CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails
FROM AAU.Patient p
INNER JOIN AnimalTypeIds aty ON aty.AnimalTypeId = p.AnimalTypeId AND p.PatientStatusId IN (1,7)
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
LEFT JOIN
(
SELECT DISTINCT t.PatientId
FROM AAU.Treatment t
WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
) t ON t.PatientId = p.PatientId
WHERE p.PatientCallOutcomeId = 1


;

ELSE

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , DATE_Format(ec.CallDatetime,"%Y-%m-%d")),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Release ready", CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails
FROM AAU.Patient p
INNER JOIN AnimalTypeIds aty ON aty.AnimalTypeId = p.AnimalTypeId AND p.PatientStatusId IN (1,7)
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId 
INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
LEFT JOIN
(
SELECT DISTINCT t.PatientId
FROM AAU.Treatment t
WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
) t ON t.PatientId = p.PatientId
WHERE p.TagNumber IN
(
	SELECT cn.TagNumber  
	FROM
		(
			SELECT
			c.TagNumber,
			ca.Area,
			c.ActionId,
			ROW_NUMBER() OVER ( PARTITION BY c.TagNumber ORDER BY c.CensusDate DESC, cac.SortAction DESC) RNum
			FROM AAU.Census c
			INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
			INNER JOIN AAU.CensusAction cac ON cac.ActionId = c.ActionId
		) cn
    WHERE cn.RNum = 1
	AND cn.Area = prm_Area
) AND p.PatientCallOutcomeId = 1;

END IF;



END$$
DELIMITER ;
