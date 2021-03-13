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
				KnownAsName			= prm_KnownAsName,
				UpdateTime			= NOW()
				
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


END

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
END;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatWithVisitDetailsByPatientId !!


DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatWithVisitDetailsByPatientId(IN prm_PatientId INT)
BEGIN
SELECT
	JSON_OBJECT( 
	"streetTreatForm",
				JSON_OBJECT(
					"streetTreatCaseId", s.StreetTreatCaseId,
				    "patientId",s.PatientId,
				    "casePriority",s.PriorityId,
				    "teamId",s.TeamId,
				    "mainProblem",s.MainProblemId,
				    "adminNotes",s.AdminComments,
                    "autoAdded",IF(ec.CallOutcomeId = 18 OR p.PatientStatusId NOT IN (1,7), true, false), 
				    "streetTreatCaseStatus",s.StatusId,
					"visits",
					JSON_ARRAYAGG(
						JSON_OBJECT(
								"visitId",v.VisitId,
								"visit_day",v.Day,
								"visit_status",v.StatusId,
								"visit_type",v.VisitTypeId,
								"visit_comments",v.AdminNotes,
                                "visit_date",v.Date,
                                "operator_notes",v.OperatorNotes
						 )
					)
				)
		) 
AS Result
	FROM
        AAU.StreetTreatCase s
        INNER JOIN AAU.Patient p ON p.PatientId = s.PatientId
        INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
        LEFT JOIN AAU.Visit v ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		s.PatientId =  prm_PatientId
	GROUP BY s.StreetTreatCaseId;
END$$
DELIMITER ;





