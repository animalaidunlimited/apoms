DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithVisitByDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithVisitByDate(IN prm_VisitDate DATE)
BEGIN

WITH casesCTE AS
(
	SELECT StreetTreatCaseId
	FROM AAU.Visit
	WHERE DATE = prm_VisitDate
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		t.TeamId,
		t.TeamName,
        t.TeamColour,
		v.Date,
		v.VisitTypeId,
		v.StatusId AS VisitStatusId,
        stc.PriorityId AS CasePriorityId,
        stc.StatusId AS CaseStatusId,
        ec.Latitude,
        ec.Longitude,
        ec.Location,
        p.TagNumber,
        p.Description,
        stc.PriorityId,
        pr.Priority,
        stc.MainProblemId,
        ec.EmergencyCaseId,
        pr.Priority AS CasePriority,
        s.Status AS CaseStatus,
        at.AnimalType,
        s.Status AS VisitStatus,
	ROW_NUMBER() OVER (PARTITION BY stc.StreetTreatCaseId ORDER BY v.Date DESC) AS RNum
	FROM AAU.Visit v
	INNER JOIN AAU.StreetTreatCase stc ON stc.StreetTreatCaseId = v.StreetTreatCaseId
	INNER JOIN AAU.Team t ON t.TeamId = stc.TeamId
	INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
	INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
	INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
    AND v.isDeleted = 0
	AND v.Date = prm_VisitDate
),
CaseCTE AS
(
SELECT
rawData.TeamId,
rawData.TeamName,
rawData.TeamColour,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus,
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("VisitDate", rawData.Date),
		JSON_OBJECT("VisitStatusId", rawData.VisitStatusId),
		JSON_OBJECT("VisitTypeId", rawData.VisitTypeId),
		JSON_OBJECT("VisitStatus",rawData.VisitStatus)
	)
) AS StreetTreatCases,

JSON_OBJECT(
  'Latitude', rawData.Latitude,
  'Longitude',rawData.Longitude,
  'Address', rawData.Location

)AS Position,
JSON_OBJECT(
  'TagNumber', rawData.TagNumber,
  'AnimalName', rawData.Description,
   "AnimalType", rawData.AnimalType,
  'Priority', rawData.Priority,
  'PatientId',rawData.PatientId,
  'EmergencyCaseId',rawData.EmergencyCaseId
) AS AnimalDetails
FROM visitsCTE rawData
WHERE RNum <= 5
GROUP BY rawData.TeamId,
rawData.TeamName,
rawData.TeamColour,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus
)

SELECT
JSON_OBJECT("Cases",
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("TeamId", cases.TeamId),
		JSON_OBJECT("TeamName", cases.TeamName),
		JSON_OBJECT("TeamColour", cases.TeamColour),
		JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
	)
)
)
AS Result
FROM
(
SELECT
caseVisits.TeamId,
caseVisits.TeamName,
caseVisits.TeamColour,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("StreetTreatCaseId", caseVisits.StreetTreatCaseId),
JSON_OBJECT("StreetTreatCasePriorityId",caseVisits.CasePriorityId),
JSON_OBJECT("StreetTreatCasePriority",caseVisits.CasePriority),
JSON_OBJECT("StreetTreatCaseStatusId",caseVisits.CaseStatusId),
JSON_OBJECT("StreetTreatCaseStatus",caseVisits.CaseStatus),
JSON_OBJECT("Visits", caseVisits.StreetTreatCases),
JSON_OBJECT("Position",caseVisits.Position),
JSON_OBJECT("AnimalDetails",caseVisits.AnimalDetails)
)) AS StreetTreatCases
FROM CaseCTE caseVisits
GROUP BY caseVisits.TeamId,
caseVisits.TeamName,
caseVisits.TeamColour
) AS cases;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAnimalTypes !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetAnimalTypes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT AnimalTypeId, AnimalType, Sort FROM AAU.AnimalType WHERE OrganisationId = vOrganisationId;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusPatientCount !!

-- CALL AAU.sp_GetCensusPatientCount('Jim')

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusPatientCount(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 09/09/2020
Purpose: Get the total count of animals in each area.

Modified By: Jim Mackenzie
Modified On: 07/Feb/2021
Modification: Altered to use function to return current area.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH TotalAreaCount
AS
(
SELECT 
DataCount.Area,
SUM(LowPriority) AS LowPriority,
SUM(NormalPriority) AS NormalPriority,
SUM(HighPriority) AS HighPriority,
SUM(Infants) AS Infants,
SUM(Adults) AS Adults,
COUNT(1) AS TotalCount 
FROM
(SELECT 
COALESCE(LatestArea.Area, AAU.fn_GetAreaForAnimalType(vOrganisationId, p.AnimalTypeId), 'Other') AS Area,
IF(p.TreatmentPriority = 4,1,0) AS LowPriority,
IF(p.TreatmentPriority = 3,1,0) AS NormalPriority,
IF(p.TreatmentPriority = 2,1,0) AS HighPriority,
IF(p.Age = 1, 1, 0) AS Infants,
IF(p.Age <> 1, 1, 0) AS Adults
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId AND ec.OrganisationId = vOrganisationId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN
(
	SELECT
		c.TagNumber,
		ca.Area,
		c.ActionId,
		ROW_NUMBER() OVER ( PARTITION BY c.TagNumber ORDER BY c.CensusDate DESC, cac.SortAction DESC) RNum
	FROM AAU.Census c
	INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
	INNER JOIN AAU.CensusAction cac ON cac.ActionId = c.ActionId
) LatestArea ON LatestArea.TagNumber = p.TagNumber AND LatestArea.RNum = 1
WHERE p.PatientStatusId IN (1,7)
AND p.IsDeleted = 0
AND ec.CallOutcomeId = 1
 )
DataCount
GROUP BY DataCount.Area)

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("area" , data.Area),
JSON_OBJECT("lowPriority" , LowPriority),
JSON_OBJECT("normalPriority" , NormalPriority),
JSON_OBJECT("highPriority" , HighPriority),
JSON_OBJECT("infants" , Infants),
JSON_OBJECT("adults" , Adults),
JSON_OBJECT("count" , data.TotalCount))) as PatientCountData
FROM
(
SELECT Area, LowPriority, NormalPriority, HighPriority, Infants, Adults, TotalCount FROM TotalAreaCount tc
UNION ALL
SELECT "Total", 0, 0, 0, 0, 0, SUM(TotalCount) FROM TotalAreaCount
) data;


END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLogs !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLogs( IN prm_recordIds TEXT)
BEGIN
	SELECT 
    UserName,
    ChangeTable,
    LoggedAction,
    DateTime AS Date,
    CONVERT(DateTime,TIME(0)) AS Time
    FROM AAU.Logging WHERE  FIND_IN_SET(RecordId,prm_recordIds);
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientByPatientId(IN prm_PatientId INT )
BEGIN


/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.

Modfied By: Jim Mackenzie
Modfied On: 07/10/2020
Purpose: Adding patient detail columns

Modfied By: Jim Mackenzie
Modfied On: 16/02/2021
Purpose: Adding patient age column
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("PatientId", p.PatientId),
	JSON_OBJECT("position", p.Position),
	JSON_OBJECT("animalTypeId", p.AnimalTypeId),
	JSON_OBJECT("tagNumber", p.TagNumber),
    JSON_OBJECT("createdDate", DATE_FORMAT(ec.CallDateTime,"%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("patientStatusId", p.PatientStatusId),
	JSON_OBJECT("patientStatusDate", DATE_FORMAT(p.PatientStatusDate, "%Y-%m-%d")),
	JSON_OBJECT("isDeleted", p.IsDeleted),
    JSON_OBJECT("PN", p.PN),
    JSON_OBJECT("suspectedRabies", p.SuspectedRabies),
    JSON_OBJECT("currentLocation", ps.PatientStatus),    
    JSON_OBJECT("mainProblems", p.MainProblems),
    JSON_OBJECT("description", p.Description),
    JSON_OBJECT("sex", p.Sex),
    JSON_OBJECT("treatmentPriority", p.TreatmentPriority),
    JSON_OBJECT("abcStatus", p.ABCStatus),
    JSON_OBJECT("releaseStatus", p.ReleaseStatus),
    JSON_OBJECT("age", p.Age),
    JSON_OBJECT("temperament", p.Temperament),
    JSON_OBJECT("knownAsName", p.KnownAsName)
    
) AS Result   
    
FROM AAU.Patient p
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE p.PatientId = prm_PatientId;



END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientDetailsbyArea !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPatientDetailsbyArea(IN prm_Username VARCHAR(45),
												IN prm_Area VARCHAR(45))
BEGIN

/*

Modified By: Jim Mackenzie
Modified On: 07/Feb/2021
Modification: Altered to use function to return current area.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH PatientCTE AS (
SELECT p.EmergencyCaseId, p.PatientId, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament, p.Age,
CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END AS `ReleaseReady`
FROM AAU.Patient p
WHERE p.PatientStatusId IN (1,7)
AND p.IsDeleted = 0
),
EmergencyCaseCTE AS (
SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)
AND ec.CallOutcomeId = 1
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Age" , p.Age),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , ec.CallDateTime),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Release ready", p.ReleaseReady),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails		
FROM PatientCTE p
INNER JOIN EmergencyCaseCTE ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
LEFT JOIN
(
SELECT DISTINCT t.PatientId
FROM AAU.Treatment t
WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
) t ON t.PatientId = p.PatientId
LEFT JOIN
(
	SELECT
		c.TagNumber,
		ca.Area,
		c.ActionId,
		ROW_NUMBER() OVER ( PARTITION BY c.TagNumber ORDER BY c.CensusDate DESC, cac.SortAction DESC) RNum
	FROM AAU.Census c
	INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
	INNER JOIN AAU.CensusAction cac ON cac.ActionId = c.ActionId
) LatestArea ON LatestArea.TagNumber = p.TagNumber AND LatestArea.RNum = 1
WHERE COALESCE(LatestArea.Area, AAU.fn_GetAreaForAnimalType(vOrganisationId, p.AnimalTypeId), 'Other') = prm_Area;



END $$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientDetails(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
                                    IN prm_AnimalTypeId INT,
                                    IN prm_MainProblems VARCHAR(256),
                                    IN prm_Description VARCHAR(256),
                                    IN prm_Sex INT,
                                    IN prm_TreatmentPriority INT,
                                    IN prm_ABCStatus INT,
                                    IN prm_ReleaseStatus INT,
                                    IN prm_Temperament INT,
                                    IN prm_Age INT,
                                    IN prm_KnownAsName VARCHAR(256))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

DECLARE vPatientExists INT;
SET vPatientExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.Patient SET
				AnimalTypeId		= prm_AnimalTypeId,
				MainProblems		= prm_MainProblems,
				Description			= prm_Description,
				Sex					= prm_Sex,
				TreatmentPriority	= prm_TreatmentPriority,
				ABCStatus			= prm_ABCStatus,
				ReleaseStatus		= prm_ReleaseStatus,
				Temperament			= prm_Temperament,		
				Age					= prm_Age,		
				KnownAsName					= prm_KnownAsName,
				UpdateTime					= NOW()
				
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO vSuccess;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_PatientId,'Patient',CONCAT('Update patient details'), NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientStatusAfterRelease !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatientStatusAfterRelease(IN prm_ReleaseDetailsId INTEGER, IN prm_ReleaseEndDate DATE)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 22/02/2021
Purpose: When the release is complete we should update the patient status with the release
end date as we know with certainty that the patient has been released.

*/

UPDATE AAU.Patient p
INNER JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
SET p.PatientStatusDate = prm_ReleaseEndDate, p.PatientStatusId = 2
WHERE rd.ReleaseDetailsId = prm_ReleaseId;


END $$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitDate !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateVisitDate(
	IN prm_ReleaseDetailsId INT
)
BEGIN
DECLARE vStreetTreatCaseId INT;
DECLARE vDay INT;
DECLARE vDate DATETIME;
DECLARE vSuccess INT;
DECLARE vVisitExists INT;

SELECT 
	StreetTreatCaseId,
    1
    INTO 
    vStreetTreatCaseId, 
	vVisitExists
FROM AAU.StreetTreatCase stc
INNER JOIN AAU.ReleaseDetails rd ON rd.PatientId = stc.PatientId AND rd.ReleaseDetailsId = prm_ReleaseDetailsId;		
    
IF vVisitExists > 0 THEN

UPDATE AAU.Visit
SET Date = ( SELECT DATE_ADD(CURRENT_DATE(), INTERVAL (`Day`) DAY )  )
WHERE 
	StreetTreatCaseId =  vStreetTreatCaseId 
	AND 
    Date IS NULL;
    SELECT 1 INTO vSuccess;
    
ELSEIF vVisitExists = 1 THEN

	SELECT 1 INTO vSuccess;

ELSEIF vVisitExists > 1 THEN

	SELECT 2 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END