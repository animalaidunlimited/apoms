DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForTeamByDate !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForTeamByDate(	IN prm_teamId INT,
														IN prm_visitDate DATE
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 18/11/2020
Purpose: Used to return active cases for the StreetTreat mobile app.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

DECLARE prmVisitDate DATE;

	SELECT IFNULL(prm_visitDate, CURDATE()) INTO prmVisitDate;

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON c.TeamId = t.TeamId AND (t.TeamId = prm_teamId OR prm_teamId = 1)
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

INNER JOIN
(
   SELECT v.StreetTreatCaseId, v.StatusId AS NextVisitStatusId, fv.NextVisit
   FROM
   (
        SELECT StreetTreatCaseId, MIN(Date) AS NextVisit
        FROM AAU.Visit
        WHERE Date >= prmVisitDate
        AND IsDeleted = FALSE
        GROUP BY StreetTreatCaseId
	) fv

	INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = fv.StreetTreatCaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId

	WHERE nv.NextVisit = prmVisitDate -- Only get active cases
    AND c.IsDeleted = 0
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));
END$$
DELIMITER ;
DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithNoVisits !!
DELIMITER $$


CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithNoVisits( IN prm_Username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

/*
Created By: Ankit Singh
Created On: 10/02/2021
Purpose: Used to return active cases for the StreetTreat screen Changed Problem with MainProblem
*/
WITH casesCTE AS
(
	SELECT st.StreetTreatCaseId
	FROM AAU.StreetTreatCase st
	WHERE OrganisationId = vOrganisationId
    AND st.StreetTreatCaseid NOT IN (
		SELECT
			v.StreetTreatCaseid
		FROM AAU.Visit v
		WHERE v.statusid < 3 AND v.date > CURDATE()
    )
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		t.TeamId,
		t.TeamName,
        t.TeamColour,
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
        mp.MainProblem,
        pr.Priority AS CasePriority,
        s.Status AS CaseStatus,
        at.AnimalType
	FROM AAU.StreetTreatCase stc
	INNER JOIN AAU.Team t ON t.TeamId = stc.TeamId
    INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
    INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = stc.MainProblemId
    INNER JOIN AAU.Status s ON s.StatusId = stc.StatusId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
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
JSON_ARRAY() AS StreetTreatCases,

        JSON_OBJECT(
          'Latitude', rawData.Latitude,
          'Longitude',rawData.Longitude,
          'Address', rawData.Location

      )AS Position,
      JSON_OBJECT(
          'TagNumber', rawData.TagNumber,
          'AnimalName', rawData.Description,
          'AnimalType', rawData.AnimalType,
          'Priority', rawData.Priority
      ) AS AnimalDetails
FROM visitsCTE rawData
GROUP BY rawData.StreetTreatCaseId, rawData.TeamId, rawData.TeamName
)

SELECT

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("TeamId", cases.TeamId),
JSON_OBJECT("TeamName", cases.TeamName),
JSON_OBJECT("TeamColour", cases.TeamColour),
JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
)) AS Result
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
GROUP BY caseVisits.TeamId,caseVisits.TeamName
) AS cases;

END$$
DELIMITER ;
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
        pb.Problem,
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
	INNER JOIN AAU.Problem pb ON pb.ProblemId = stc.MainProblemId
	INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
	AND v.Date <= prm_VisitDate
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
END $$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAllTeams !!

DELIMITER $$
CREATE PROCEDURE  AAU.sp_GetAllTeams( IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to return a list of the teams

Modified By: Ankit Singh
Modifeid On: 03/02/2021
Purpose: Used to return a list of the teams with colour
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

SELECT t.TeamId, t.TeamName, t.Capacity, t.TeamColour, COUNT(u.UserId) AS Members, t.IsDeleted
FROM AAU.Team t
LEFT OUTER JOIN AAU.User u ON u.TeamId = t.TeamId
WHERE t.IsDeleted != 1
AND t.OrganisationId = vOrganisationId
GROUP BY t.TeamId, t.TeamName, t.Capacity, t.IsDeleted, t.TeamColour;

END$$
DELIMITER ;
DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetAllVisitsAndDates !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_GetAllVisitsAndDates( IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Used to return all visit in a month Chart.
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

WITH chart AS (
	SELECT 
		v.Date,
        JSON_OBJECT(
		"name",t.TeamName,
		"value",count(t.TeamName)
        ) AS series
	FROM AAU.Visit v
	LEFT JOIN AAU.StreetTreatCase st ON st.StreetTreatCaseId= v.StreetTreatCaseId 
	LEFT JOIN AAU.Team t ON t.TeamId = st.TeamId
	WHERE v.IsDeleted = 0 AND v.Date BETWEEN DATE(NOW()) - INTERVAL 7 DAY AND DATE(NOW()) + INTERVAL 14 DAY
    AND stc.OrganisationId = vOrganisationId
    GROUP BY v.Date,t.TeamName
),
teamColours AS (
	SELECT JSON_ARRAYAGG(JSON_OBJECT("name",t.TeamName,"value", t.TeamColour)) AS teamColours FROM AAU.Team t WHERE t.OrganisationId = vOrganisationId
),
chartData AS (
	SELECT 
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("name",DATE_FORMAT(chart.Date,"%e/%m")),
			JSON_OBJECT("series",JSON_ARRAYAGG(chart.series))
	) AS chartData
	FROM chart GROUP BY chart.Date 
)

SELECT 
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("teamColours",teamColours.teamColours),
    JSON_OBJECT("chartData",JSON_ARRAYAGG(chartData.chartData))
    ) AS Result
FROM teamColours, chartData GROUP BY teamColours.teamColours;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusErrorRecords !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusErrorRecords(IN prm_UserName VARCHAR(45))
BEGIN

/* 
Created by: Arpit Trivedi
Created Date: 09/02/2021
Purpose: To show census errors.
*/

SELECT  
ErrorRecords.PatientId AS "PatientId",
ErrorRecords.TagNumber AS "TagNumber",
DATE_FORMAT(ec.CallDateTime, "%Y-%m-%d") AS "CallDateTime",
DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%d") AS "AdmissionTime",
ps.PatientStatus AS "PatientStatus",
DATE_FORMAT(p.PatientStatusDate, "%Y-%m-%d") AS "PatientStatusDate",
cl.Name AS "CallerName",
cl.Number AS "Number",
SUBSTRING(
CONCAT(
	IF(ErrorRecords.PatientId IS NULL,"+ No Patient ",""),
	IF(ErrorRecords.MovementError = 1,"+ Incorrect movement ",""),
    IF(ErrorRecords.MovedInOutCountMissmatch = -2, "+ Movement count missmatch", ""),
	IF(ErrorRecords.noAdmissionError = -1,"+ No admission ",
	IF(ErrorRecords.noAdmissionError > 1, "+ Duplicate admission ",""))
),3) AS "ErrorLog"
FROM
(
	SELECT
	DISTINCT censusErrorRecords.PatientId,
	censusErrorRecords.TagNumber,
	1 AS MovementError,
	noAdmissionTags.noAdmissionError,
    noAdmissionTags.MovedInOutCountMissmatch
	FROM
	(
		SELECT census.CensusDate,
		census.PatientId, census.Area, census.Action, census.TagNumber, census.PreArea,census.PreAction,census.PreCensusDate, census.PostAction,
		(
			CASE
			WHEN census.Action = 'Admission' AND census.PreArea IS NULL THEN 0  
			WHEN census.Action = 'Moved Out' AND census.PreArea = census.Area AND census.PreAction IN ('Admission','Moved In') AND census.PostAction IS NOT NULL THEN 0
			WHEN census.Action = 'Moved In' AND census.PreArea <> census.Area AND census.PreAction = 'Moved Out' AND census.CensusDate = census.PreCensusDate THEN 0
			ELSE 1
			END
		) AS ErrorFlag
		FROM
		(
			SELECT c.CensusDate,
			c.AreaId,
			ca.Area ,
			c.ActionId ,
			csa.Action,
			c.TagNumber,
			c.PatientId,
			LAG(ca.Area,1) OVER( PARTITION BY c.TagNumber ORDER BY c.CensusDate, c.ActionId ) as PreArea,
			LAG(csa.Action,1) OVER( PARTITION BY c.TagNumber ORDER BY c.CensusDate, c.ActionId) as PreAction,
			LAG(c.CensusDate,1) OVER( PARTITION BY c.TagNumber ORDER BY c.CensusDate, c.ActionId) as PreCensusDate,
			LEAD(csa.Action,1) OVER( PARTITION BY c.TagNumber ORDER BY c.CensusDate, c.ActionId) as PostAction
			FROM AAU.Census c
			INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
			INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId
		) census
	) censusErrorRecords
	LEFT JOIN(
		SELECT noAdmission.PatientId,
		(
			CASE WHEN noAdmission.Admission = 0 THEN -1
			WHEN noAdmission.Admission > 1 THEN 2
			ELSE 0 END
		) AS noAdmissionError,
        (
			CASE WHEN noAdmission.MovedOut <> noAdmission.MovedOut
            THEN -1
            ELSE 0 END
        ) AS MovedInOutCountMissmatch
		FROM
		(
			SELECT p.PatientId,
			SUM(IF(c.ActionId = 1, 1, 0)) AS Admission,
            SUM(IF(c.ActionId = 2, 1, 0)) AS MovedOut,
            SUM(IF(c.ActionId = 3, 1, 0)) AS MovedIn
			FROM AAU.Patient p
			INNER JOIN AAU.Census c ON c.PatientId = p.PatientId
			INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
			WHERE p.PatientStatusId IN (1,7)
			AND ec.CallOutcomeId =1
			AND p.AnimalTypeId IN (5,10)
			GROUP BY p.PatientId,p.TagNumber
		) noAdmission
	) AS noAdmissionTags ON noAdmissionTags.PatientId = censusErrorRecords.PatientId
	WHERE censusErrorRecords.ErrorFlag = 1
) ErrorRecords
LEFT JOIN AAU.Patient p ON p.PatientId = ErrorRecords.PatientId
LEFT JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
LEFT JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
LEFT JOIN AAU.Caller cl ON cl.CallerId = ecr.CallerId;


END$$
DELIMITER ;
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

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseByDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCaseByDate(IN prm_UserName VARCHAR(45),
												IN prm_Date DATETIME,
												IN prm_Outcome INT)
BEGIN

/*
CreatedDate: 20/01/2021
CreatedBy: Arpit Trivedi
Purpose: To get the emergencycase count on date
*/

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT 
ec.EmergencyNumber as "emergencyNumber",
DATE_Format(ec.CallDateTime,"%Y-%m-%dT%H:%i:%s") as "callDateTime",
at.AnimalType as "animalType",
p.TagNumber as "tagNumber",
ec.Location as "location",
u.FirstName as "dispatcher",
r1.FirstName as "staff1",
r2.FirstName as "staff2",
co.CallOutcome as "callOutcome"
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN AAU.User u ON u.UserId = ec.DispatcherId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = ec.CallOutcomeId
INNER JOIN AAU.PatientProblem pp ON pp.PatientId = p.PatientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
WHERE CAST(ec.CallDateTime AS DATE) = prm_Date
AND ec.OrganisationId = vOrganisationId
AND (ec.CallOutcomeId = prm_Outcome OR prm_Outcome IS NULL);
-- ec.CallOutcomeId = IFNULL(prm_Outcome,ec.CallOutcomeId)



END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCaseById( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT 
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
JSON_OBJECT("callDateTime", DATE_FORMAT(ec.CallDateTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("dispatcher", ec.DispatcherId),
CASE WHEN ec.EmergencyCodeId IS NOT NULL
THEN JSON_OBJECT("code",
JSON_MERGE_PRESERVE(
JSON_OBJECT("EmergencyCodeId", ec.EmergencyCodeId),
JSON_OBJECT("EmergencyCode", c.EmergencyCode)
))
ELSE JSON_OBJECT("code", '')
END,
JSON_OBJECT("updateTime", DATE_FORMAT(ec.UpdateTime, "%Y-%m-%dT%H:%i:%s"))
)),
JSON_OBJECT("caseComments", ec.Comments),
JSON_OBJECT("callOutcome",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallOutcome",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallOutcomeId", ec.CallOutcomeId),
JSON_OBJECT("CallOutcome", o.CallOutcome)
)),
JSON_OBJECT("sameAsNumber", sa.EmergencyNumber)
)
)

) AS Result
			
FROM AAU.EmergencyCase ec
LEFT JOIN AAU.EmergencyCode c ON c.EmergencyCodeId = ec.EmergencyCodeId
LEFT JOIN AAU.CallOutcome o ON o.CallOutcomeId = ec.CallOutcomeId
LEFT JOIN AAU.EmergencyCase sa ON sa.EmergencyCaseId = ec.SameAsEmergencyCaseId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId( IN prm_EmergencyCaseId INT, IN prm_PatientId INT)
BEGIN


/**************************************************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues for display in the rescue board.

Updated By: Arpit Trivedi
Date: 29/11/2020
Purpose: To retrieve outstanding rescues and releases for display on board.
***************************************************************************/

 WITH BastPatientsCTE AS
 (
 SELECT PatientId
 FROM AAU.Patient
 WHERE EmergencyCaseId = prm_EmergencyCaseId
 AND (PatientId = prm_PatientId OR prm_PatientId IS NULL)
 ),
 PatientsCTE AS
 (
 SELECT
		p.EmergencyCaseId,
        MAX(p.PatientId) AS PatientId,
        JSON_Object("patients",
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems
            )
		)) AS Patients     
    FROM AAU.Patient p
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,
		JSON_OBJECT("problems", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM BastPatientsCTE)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM BastPatientsCTE)
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM BastPatientsCTE)
    GROUP BY p.EmergencyCaseId,
    rd.ReleaseDetailsId
)


SELECT JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", AAU.fn_GetRescueStatus(rd.ReleaseDetailsId, 
																rd.RequestedUser, 
																rd.RequestedDate, 
																rd.Releaser1Id, 
																rd.Releaser2Id, 
																rd.PickupDate, 
																rd.BeginDate, 
																rd.EndDate,
																ec.Rescuer1Id,
																ec.Rescuer2Id, 
																ec.AmbulanceArrivalTime, 
																ec.RescueTime, 
																ec.AdmissionTime, 
																ec.CallOutcomeId
																)),
                                                                JSON_OBJECT("staff1", IF(rd.ReleaseDetailsId IS NULL,r1.UserId,rd.Releaser1Id)),
			JSON_OBJECT("staff1Abbreviation", IF(rd.ReleaseDetailsId IS NULL,r1.Initials,rl1.Initials)),
            JSON_OBJECT("staff1Colour", IF(rd.ReleaseDetailsId IS NULL, r1.Colour,rl1.Colour)),
			JSON_OBJECT("staff2",IF(rd.ReleaseDetailsId IS NULL,r2.UserId,rd.Releaser2Id)),
			JSON_OBJECT("staff2Abbreviation", IF(rd.ReleaseDetailsId IS NULL,r2.Initials,IFNULL(rl2.Initials,''))),
            JSON_OBJECT("staff2Colour", IF(rd.ReleaseDetailsId IS NULL, r2.Colour,IF(rd.Releaser2Id IS NULL, null, rl2.Colour))),
            JSON_OBJECT("ambulanceArrivalTime", ec.AmbulanceArrivalTime),
            JSON_OBJECT("rescueTime", ec.RescueTime),
            JSON_OBJECT("releaseId", rd.ReleaseDetailsId),
            JSON_OBJECT("requestedDate", DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")),
			JSON_OBJECT("pickupDate", DATE_FORMAT(rd.PickupDate, "%Y-%m-%dT%H:%i:%s")),
			JSON_OBJECT("releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s")),
			JSON_OBJECT("releaseEndDate", DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")),
            JSON_OBJECT("releaseType", CONCAT(IF(rd.ReleaseDetailsId IS NULL,"","Normal"), IF(IFNULL(rd.ComplainerNotes,"") <> ""," + Complainer special instructions",""), IF(rd.Releaser1Id IS NULL,""," + Specific staff"), IF(std.StreetTreatCaseId IS NULL,""," + StreetTreat release"))),
            JSON_OBJECT("ambulanceAction", IF(rd.ReleaseDetailsId IS NULL, 'Rescue', 'Release')),
			JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
            JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
            JSON_OBJECT("emergencyCodeId", ec.EmergencyCodeId),
            JSON_OBJECT("emergencyCode", ecd.EmergencyCode),
            JSON_OBJECT("callDateTime", ec.CallDateTime),
            JSON_OBJECT("callOutcomeId", ec.CallOutcomeId),
 			JSON_OBJECT('callerDetails', ca.CallerDetails),
            JSON_OBJECT("filteredCandidate", TRUE),
            p.Patients,
            JSON_OBJECT("location", ec.Location),
            JSON_OBJECT("latitude", ec.Latitude),
            JSON_OBJECT("longitude", ec.Longitude),
			JSON_OBJECT("latLngLiteral",
				JSON_MERGE_PRESERVE(
				JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
				JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
				))) AS `ambulanceAssignment`
FROM PatientsCTE p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN (
	SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName',c.Name),
	JSON_OBJECT('callerNumber', c.Number)
	)) AS callerDetails
	FROM AAU.Caller c
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId = prm_EmergencyCaseId
	GROUP BY ecr.EmergencyCaseId
) ca ON ca.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = rd.PatientId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId
LEFT JOIN AAU.User rl1 ON rl1.UserId = rd.Releaser1Id
LEFT JOIN AAU.User rl2 ON rl2.UserId = rd.Releaser2Id
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutstandingRescues (IN prm_UserName VARCHAR(45))
BEGIN


/*****************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues
for display in the rescue board.
*****************************************/

/*****************************************
Updated By: Jim Mackenzie
Date: 29/11/2020
Purpose: To retrieve outstanding rescues and releases
for display on  board.
*****************************************/



DECLARE vOrganisationId INT;
DECLARE ReleaseType VARCHAR(60);

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

WITH RescuesReleases AS
(
SELECT PatientId
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
WHERE ec.OrganisationId = vOrganisationId
AND ec.CallOutcomeId IS NULL
AND p.IsDeleted = 0

UNION

SELECT PatientId
FROM AAU.ReleaseDetails rd
WHERE rd.OrganisationId = vOrganisationId
AND rd.EndDate IS NULL

),
EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescuesReleases)
),
CallerCTE AS 
(
SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName', c.Name),
	JSON_OBJECT('callerNumber', c.Number)
	)) AS callerDetails
	FROM AAU.Caller c
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds)
	GROUP BY ecr.EmergencyCaseId
),
PatientsCTE AS
(
    SELECT
		p.EmergencyCaseId,
        MAX(p.PatientId) AS PatientId,
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems
		)) AS Patients     
    FROM AAU.Patient p    
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,
			JSON_OBJECT("problems", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM RescuesReleases)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescuesReleases)
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescuesReleases)
    GROUP BY p.EmergencyCaseId
),
ReleaseRescueCTE AS
(
SELECT AAU.fn_GetRescueStatus(
				rd.ReleaseDetailsId, 
				rd.RequestedUser, 
				rd.RequestedDate, 
				rd.Releaser1Id, 
				rd.Releaser2Id, 
                rd.PickupDate,
				rd.BeginDate, 
				rd.EndDate, 
				ec.Rescuer1Id, 
				ec.Rescuer2Id, 
				ec.AmbulanceArrivalTime, 
				ec.RescueTime, 
				ec.AdmissionTime, 
				ec.CallOutcomeId
            ) AS ActionStatus,
            IF(rd.ReleaseDetailsId IS NULL,'Rescue','Release') AS AmbulanceAction,
            rd.ReleaseDetailsId,
            rd.RequestedDate,
            rd.ComplainerNotes,
            rd.Releaser1Id,
            std.StreetTreatCaseId,
            rd.PickupDate,
            rd.BeginDate,
            rd.EndDate,
            IF(rd.ReleaseDetailsId IS NULL,ec.Rescuer1Id, rd.Releaser1Id) AS Staff1Id,
			IF(rd.ReleaseDetailsId IS NULL, ec.Rescuer2Id, rd.Releaser2Id) AS Staff2Id,
            ec.AmbulanceArrivalTime,
            ec.RescueTime,            
			ec.EmergencyCaseId,
            ec.EmergencyNumber,
            ec.EmergencyCodeId,
            ecd.EmergencyCode,
            ec.CallDateTime,
            ec.CallOutcomeId,
            ec.Location,			
            JSON_MERGE_PRESERVE(
            JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
            JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
            ) AS latLngLiteral,            
            JSON_OBJECT("callerDetails",c.callerDetails) AS callerDetails,
            JSON_OBJECT("patients",p.Patients) AS Patients
FROM PatientsCTE p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN CallerCTE c ON c.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = rd.PatientId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId
),
actionsCTE AS 
(
SELECT	
	r.ActionStatus,
    r.Staff1Id,
    r.Staff2Id,
    JSON_OBJECT("ambulanceAction", r.AmbulanceAction) AS AmbulanceAction,
    JSON_OBJECT("ambulanceAssignment",
    JSON_ARRAYAGG(
    JSON_MERGE_PRESERVE(
    JSON_OBJECT("actionStatus", IFNULL(r.ActionStatus,'')),
    JSON_OBJECT("ambulanceAction", IFNULL(r.AmbulanceAction,'')),    
	JSON_OBJECT("releaseId", r.ReleaseDetailsId),
    JSON_OBJECT("requestedDate", DATE_FORMAT(r.RequestedDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseType", CONCAT(IF(r.ReleaseDetailsId IS NULL,"","Normal"), IF(IFNULL(r.ComplainerNotes,"") <> ""," + Complainer special instructions",""), IF(r.Releaser1Id IS NULL,""," + Specific staff"), IF(r.StreetTreatCaseId IS NULL,""," + StreetTreat release"))),
	JSON_OBJECT("pickupDate", DATE_FORMAT(r.PickupDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseBeginDate", DATE_FORMAT(r.BeginDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseEndDate", DATE_FORMAT(r.EndDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("staff1", r.Staff1Id),
	JSON_OBJECT("staff2", r.Staff2Id),
	JSON_OBJECT("ambulanceArrivalTime", IFNULL(r.AmbulanceArrivalTime,'')),
	JSON_OBJECT("rescueTime", IFNULL(r.RescueTime,'')),            
	JSON_OBJECT("emergencyCaseId", r.EmergencyCaseId),
	JSON_OBJECT("emergencyNumber", r.EmergencyNumber),
	JSON_OBJECT("emergencyCodeId", r.EmergencyCodeId),
    JSON_OBJECT("emergencyCode", r.EmergencyCode),
	JSON_OBJECT("callDateTime", IFNULL(r.CallDateTime,'')),
	JSON_OBJECT("callOutcomeId", IFNULL(r.CallOutcomeId,'')),
	JSON_OBJECT("location", IFNULL(r.Location,'')),
	JSON_OBJECT("latLngLiteral", r.latLngLiteral),
	r.callerDetails,
    JSON_OBJECT("filteredCandidate", TRUE),
	IFNULL(r.Patients,'')
    ))) AS ambulanceAssignment
FROM ReleaseRescueCTE r
GROUP BY	r.Staff1Id,
			r.Staff2Id,
			r.ActionStatus,
			r.AmbulanceAction
),
ActionGroupsCTE AS
(
SELECT
ag.ActionStatus,
JSON_OBJECT("staff1", ag.Staff1Id) AS Staff1Id,
JSON_OBJECT("staff1Abbreviation", s1.Initials) AS Staff1Initials,
JSON_OBJECT("staff2", ag.Staff2Id) AS Staff2Id,
JSON_OBJECT("staff2Abbreviation", s2.Initials) AS Staff2Initials,
JSON_OBJECT("actions", 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
ag.AmbulanceAction,
ag.ambulanceAssignment))) AS ActionGroups
FROM actionsCTE ag
LEFT JOIN AAU.User s1 ON s1.UserId = ag.Staff1Id
LEFT JOIN AAU.User s2 ON s2.UserId = ag.Staff2Id
GROUP BY
ag.ActionStatus,
ag.Staff1Id,
s1.Initials,
ag.Staff2Id,
s2.Initials
),
StatusGroupCTE AS
(
SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", ag.ActionStatus),
JSON_OBJECT("actionStatusName",
CASE ag.ActionStatus
WHEN 1 THEN "Received"
WHEN 2 THEN "Assigned"
WHEN 3 THEN "Arrived/Picked"
WHEN 4 THEN "Rescued/Released"
WHEN 5 THEN "Admitted"
END
),
JSON_OBJECT("statusGroups",
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
ag.Staff1Id,
ag.Staff1Initials,
ag.Staff2Id,
ag.Staff2Initials,
ag.ActionGroups)))) AS ActionStatusGroups
FROM ActionGroupsCTE ag
GROUP BY ag.ActionStatus
)

SELECT 

JSON_OBJECT("outstandingActions", 
JSON_ARRAYAGG(
stat.ActionStatusGroups)
) AS Result

FROM StatusGroupCTE stat;
 
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
    JSON_OBJECT("temperament", p.Temperament)
    
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
SELECT p.EmergencyCaseId, p.PatientId, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament,p.Age,
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
DROP PROCEDURE IF EXISTS AAU.sp_GetReleaseDetailsById !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetReleaseDetailsById(IN prm_PatientId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 21/11/2020
Purpose: To fetch release details of a patient.


Modified By: Ankit Singh
Modified On: 28/01/2021
Purpose: To seperate visit data
*/
SELECT
	JSON_OBJECT( 
		"releaseId",rd.ReleaseDetailsId,
		"patientId",rd.PatientId,
		"releaseRequestForm",
			JSON_OBJECT(
				"requestedUser",u.UserName, 
				"requestedDate",DATE_FORMAT(rd.RequestedDate, "%Y-%m-%d")
			), 
		"complainerNotes",rd.ComplainerNotes,
		"complainerInformed",rd.ComplainerInformed,
		"Releaser1",rd.Releaser1Id, 
		"Releaser2",rd.Releaser2Id, 
		"releaseBeginDate",DATE_FORMAT(rd.BeginDate, "%Y-%m-%d"), 
		"releaseEndDate",DATE_FORMAT(rd.EndDate, "%Y-%m-%d")
	) 
AS Result
	FROM
        AAU.ReleaseDetails rd
        INNER JOIN AAU.User u ON u.UserId = rd.RequestedUser
        LEFT JOIN AAU.StreetTreatCase s ON rd.PatientID = s.PatientId
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		rd.PatientId =  prm_PatientId
	GROUP BY rd.ReleaseDetailsId;
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetScoreCard!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetScoreCard()
BEGIN

DECLARE TotalActiveCases INT;
DECLARE CasesWithVisitToday INT;
DECLARE VisitsToday INT;
DECLARE TotalPlannedVisits INT;
DECLARE OutstandingVisitsToday INT;
DECLARE CompleteVisitsToday INT;
DECLARE TotalUrgentCases INT;
DECLARE OutstandingUrgentVisitsToday INT;
DECLARE CompletedUrgentVisitsToday INT;
DECLARE NoVisits INT;

SET TotalActiveCases = 0;
SET CasesWithVisitToday = 0;
SET VisitsToday = 0;
SET TotalPlannedVisits = 0;
SET OutstandingVisitsToday = 0;
SET CompleteVisitsToday = 0;
SET TotalUrgentCases = 0;
SET OutstandingUrgentVisitsToday = 0;
SET CompletedUrgentVisitsToday = 0;
SET NoVisits = 0;

/*
1: Cases with a visit today
1: All Active cases
2: Total planned visits
3: Visits complete today
3: Visits today (same as cases with a visit today)
4: Total active urgent cases
5: Urgent visits complete today
5: Total urgent visits today
6: Cases flagged for early completion today
*/


-- 1: Cases with a visit today
-- 3: Visits today (same as cases with a visit today)
-- 3: Visits complete today
-- 5: Urgent visits complete today
-- 5: Total urgent visits today



SELECT
	COUNT(DISTINCT c.StreetTreatCaseId),
	COUNT(DISTINCT v.VisitId),
	SUM(CASE WHEN c.PriorityId = 4 AND v.StatusId > 2 THEN 1 ELSE 0 END),
	SUM(CASE WHEN c.PriorityId = 4 AND v.StatusId <= 2 THEN 1 ELSE 0 END),
	sum(CASE WHEN v.statusid <= 2 THEN 1 ELSE 0 END),
	sum(CASE WHEN v.statusid > 2 THEN 1 ELSE 0 END)
INTO
	CasesWithVisitToday,
    VisitsToday,
    OutstandingUrgentVisitsToday,
    CompletedUrgentVisitsToday,
    OutstandingVisitsToday,
    CompleteVisitsToday
FROM AAU.StreetTreatCase c
INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = c.StreetTreatCaseId
WHERE v.Date = CURDATE()
AND v.IsDeleted = false
AND c.IsDeleted = false;


-- 1: All Active cases
-- 4: Total active urgent cases
SELECT
	COUNT(1),
	SUM(CASE WHEN c.PriorityId = 4 THEN 1 ELSE 0 END)
INTO
    TotalActiveCases,
    TotalUrgentCases
FROM AAU.StreetTreatCase c
WHERE c.StatusId <= 2; -- Total Cases


-- 2: Total planned visits 
	SELECT 
		SUM(CASE WHEN v.StreetTreatCaseId IS NULL THEN 1 ELSE 0 END) ,
		SUM(CASE WHEN v.StreetTreatCaseId IS NULL THEN 0 ELSE 1 END)
	INTO NoVisits, TotalPlannedVisits
	FROM AAU.StreetTreatCase stc
	LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = stc.StreetTreatCaseId AND v.StatusId <= 2 AND v.Date >= CURDATE()
	WHERE stc.StatusId <= 2;

SELECT	IFNULL(TotalActiveCases,0) AS TotalActiveCases,
		IFNULL(CasesWithVisitToday,0) AS CasesWithVisitToday,
		IFNULL(VisitsToday,0) AS VisitsToday,
		IFNULL(TotalPlannedVisits,0) AS TotalPlannedVisits,
		IFNULL(OutstandingVisitsToday,0) AS OutstandingVisitsToday,
		IFNULL(CompleteVisitsToday,0) AS CompleteVisitsToday,
		IFNULL(TotalUrgentCases,0) AS TotalUrgentCases,
		IFNULL(OutstandingUrgentVisitsToday,0) AS OutstandingUrgentVisitsToday,
		IFNULL(CompletedUrgentVisitsToday,0) AS CompletedUrgentVisitsToday,
        IFNULL(NoVisits,0) AS NoVisits;

END$$
DELIMITER ;
DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatCaseById !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatCaseById( IN prm_streetTreatCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return a case by ID.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id.

Modified By: Ankit Singh
Modified On: 23/12/2020
Description: Adding Primary Caller Name and Number. 

Modified By: Ankit Singh
Modified On: 28/01/2021
Description: Adding Case END and Begin Date. 
*/


SELECT	c.StreetTreatCaseId AS CaseId,
		ec.EmergencyNumber,
		p.TagNumber,
		pc.PercentComplete,
		nv.NextVisit,
		at.AnimalTypeId,
		c.PriorityId,
		c.StatusId,
		c.TeamId,
        ec.EmergencyCaseId,
		p.Description AS AnimalName,
		caller.Name AS ComplainerName,
		caller.Number AS ComplainerNumber,
		ec.Location AS Address,
		ec.Latitude,
		ec.Longitude,
		c.AdminComments AS AdminNotes,
		c.OperatorNotes,
        DATE_FORMAT(CAST( 
        ( CASE 
			WHEN ec.CallOutcomeId = 18 THEN
				ec.CallDateTime
            ELSE
				IFNULL(rd.EndDate,p.PatientStatusDate)
            END
		) AS Date),"%Y-%m-%d") AS BeginDate,
        DATE_FORMAT(CAST(c.ClosedDate AS Date),"%Y-%m-%d") AS EndDate,
        IFNULL(ce.IsIsolation,0) AS IsIsolation,
        c.EarlyReleaseFlag,
		c.IsDeleted,
        c.MainProblemId
FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.EmergencyCaller ecall ON ecall.EmergencyCaseId = ec.EmergencyCaseId AND ecall.PrimaryCaller = 1
    INNER JOIN AAU.Caller caller ON caller.CallerId = ecall.CallerId 
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN
		(
		SELECT TagNumber, TRUE AS IsIsolation
		FROM AAU.Census c
		INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
		WHERE ca.Area LIKE '%ISO%'
		) ce ON ce.TagNumber = p.TagNumber
LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		DATE_FORMAT(MIN(Date),"%Y-%m-%d") AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
WHERE c.StreetTreatCaseId = prm_streetTreatCaseId;

SELECT 1 AS Success;

END$$
DELIMITER ;
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
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		s.PatientId =  prm_PatientId
	GROUP BY s.StreetTreatCaseId;
END$$
DELIMITER ;
DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetTeamByTeamId !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTeamByTeamId(IN prm_TeamId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/08/2018
Purpose: Used to return a team by ID.
*/

SELECT
		t.TeamId,
		t.TeamName,
		SUM(t.Capacity) AS Capacity
FROM AAU.Team t
LEFT JOIN AAU.Case c ON c.TeamId = t.TeamId
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = c.CaseId
WHERE (t.TeamId = prm_TeamId OR prm_TeamId IS NULL)
GROUP BY 	t.TeamId,
			t.TeamName;
END

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertAndUpdateStreetTreatCase !!


DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertAndUpdateStreetTreatCase(
									IN prm_PatientId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_TeamId INT,
                                    IN prm_MainProblemId INT,
									IN prm_AdminComments VARCHAR(256),
									IN prm_OperatorNotes VARCHAR(256),
                                    IN prm_ClosedDate DATE,
                                    IN prm_EarlyReleaseFlag BOOLEAN,
                                    IN prm_AnimalDescription VARCHAR(256)
)
BEGIN
/*
Created By: Ankit Singh
Created On: 02/12/2020
Purpose: Used to insert a new case.
*/

DECLARE vCaseNoExists INT;
DECLARE vSuccess INT;
DECLARE vStreetTreatCaseId INT;
SET vCaseNoExists = 0;

SELECT COUNT(1), StreetTreatCaseId INTO vCaseNoExists, vStreetTreatCaseId 
FROM AAU.StreetTreatCase 
WHERE PatientId = prm_PatientId GROUP BY PatientId;

IF vCaseNoExists = 0 THEN

	INSERT INTO AAU.StreetTreatCase
						(
                        PatientId,
						PriorityId,
						StatusId,
						TeamId,
                        MainProblemId,
						AdminComments,
						OperatorNotes,
                        ClosedDate,
                        EarlyReleaseFlag
						)
				VALUES
						(
                        prm_PatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag
						);
	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vStreetTreatCaseId;
    
    UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreetTreatCaseId,'Case','Insert', NOW());
    
ELSEIF vCaseNoExists > 0 THEN

    UPDATE  AAU.StreetTreatCase
    SET 
		PriorityId			= prm_PriorityId,
		StatusId			= prm_StatusId,
		TeamId				= prm_TeamId,
		MainProblemId		= prm_MainProblemId,
		AdminComments		= prm_AdminComments,
		OperatorNotes		= prm_OperatorNotes,
		ClosedDate			= prm_ClosedDate,
		EarlyReleaseFlag	= prm_EarlyReleaseFlag
	WHERE
		PatientId = prm_PatientId;
        
	UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;
        
	SELECT 2 INTO vSuccess;

ELSE
	SELECT 3 INTO vSuccess;
END IF;

SELECT vStreetTreatCaseId AS streetTreatCaseId, vSuccess AS success;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertEmergencyCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertEmergencyCase(
									IN prm_UserName VARCHAR(64),
                                    IN prm_GUID VARCHAR(128),
                                    -- IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									IN prm_CallOutcomeId INT,
                                    IN prm_SameAsNumber INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DECIMAL(11,8),
									IN prm_Longitude DECIMAL(11,8),
									IN prm_Rescuer1Id INT,
									IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/02/2020
Purpose: Used to insert a new emergency case.
*/
DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vEmNoExists INT;
DECLARE vCurrentCaseId INT;
DECLARE vEmergencyNumber INT;
DECLARE vEmergencyCaseId INT;
DECLARE vSocketEndpoint VARCHAR(64);
DECLARE vSuccess INT;
SET vEmNoExists = 0;
SET vOrganisationId = 0;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01'), MAX(EmergencyCaseId) INTO 
vEmNoExists, vUpdateTime, vCurrentCaseId
FROM AAU.EmergencyCase WHERE GUID = prm_GUID;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

START TRANSACTION ;

IF vEmNoExists = 0 THEN

SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

-- LOCK TABLES AAU.EmergencyCase WRITE;

SELECT MAX(EmergencyNumber + 1) INTO vEmergencyNumber FROM AAU.EmergencyCase
WHERE OrganisationId = vOrganisationId FOR UPDATE;

INSERT INTO AAU.EmergencyCase
(
	OrganisationId,
	EmergencyNumber,
	CallDateTime,
	DispatcherId,
	EmergencyCodeId,
	CallOutcomeId,
    SameAsEmergencyCaseId,
	Location,
	Latitude,
	Longitude,
	Rescuer1Id,
	Rescuer2Id,
	AmbulanceArrivalTime,
	RescueTime,
	AdmissionTime,
    UpdateTime,
    Comments,
    GUID
)
VALUES
(
	vOrganisationId,
	vEmergencyNumber,
	prm_CallDateTime,
	prm_DispatcherId,
	prm_EmergencyCodeId,
	prm_CallOutcomeId,
    vSameAsEmergencyCaseId,
	prm_Location,
	prm_Latitude,
	prm_Longitude,
	prm_Rescuer1Id,
	prm_Rescuer2Id,
	prm_AmbulanceArrivalTime,
	prm_RescueTime,
	prm_AdmissionTime,
    prm_UpdateTime,
    prm_Comments,
    prm_GUID
);

-- UNLOCK TABLES;

COMMIT;
	
    SELECT LAST_INSERT_ID(),1 INTO vEmergencyCaseId,vSuccess;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId,ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,vEmergencyCaseId,'EmergencyCase','Insert', NOW());
    
ELSEIF vEmNoExists >= 1 THEN

	SELECT 2, vCurrentCaseId INTO vSuccess, vEmergencyCaseId; -- Duplicate
    SELECT MAX(EmergencyNumber) INTO vEmergencyNumber FROM AAU.EmergencyCase;
    
ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3, vCurrentCaseId INTO vSuccess, vEmergencyCaseId; -- Already updated

ELSE 
	SELECT 4 INTO vSuccess; -- Other error
    SELECT vCurrentCaseId INTO vEmergencyCaseId;
END IF;


SELECT vSuccess as success, vEmergencyCaseId, vEmergencyNumber,vSocketEndPoint;  

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertReleaseDetails !!


DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertReleaseDetails(IN prm_UserName NVARCHAR(45),
												IN prm_PatientId INT,
												IN prm_ComplainerNotes NVARCHAR(450),
												IN prm_ComplainerInformed TINYINT,
												IN prm_Releaser1Id INT,
												IN prm_Releaser2Id INT,
												IN prm_RequestedUser NVARCHAR(45),
												IN prm_RequestedDate DATE
											)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: Used to insert a release of a patient.
*/

DECLARE vSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vReleaseId INT;
DECLARE vOrganisationId INT;
DECLARE vUserId INT;
DECLARE vSocketEndPoint CHAR(3);
DECLARE vEmergencyCaseId INT;

SET vReleaseCount = 0;
SET vOrganisationId = 1;
SET vReleaseId = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vReleaseCount FROM AAU.ReleaseDetails WHERE PatientId = prm_PatientId;

SELECT o.OrganisationId, u.UserId, o.SocketEndPoint INTO vOrganisationId, vUserId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_RequestedUser LIMIT 1;
 
IF vReleaseCount = 0 THEN

INSERT INTO AAU.ReleaseDetails (OrganisationId,
								PatientId,
                                RequestedUser,
                                RequestedDate,
                                ComplainerNotes,
                                ComplainerInformed,
                                Releaser1Id,
                                Releaser2Id)
								VALUES
                                (vOrganisationId,
                                prm_PatientId,
                                vUserId,
                                prm_RequestedDate,
                                prm_ComplainerNotes,
                                IF(prm_ComplainerInformed,1,0),
                                prm_Releaser1Id,
                                prm_Releaser2Id
                                );

SELECT LAST_INSERT_ID() INTO vReleaseId;
SELECT 1 INTO vSuccess;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_UserName,vReleaseId,'Release','Insert', NOW());

ELSEIF vReleaseCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT EmergencyCaseId INTO vEmergencyCaseId FROM AAU.Patient WHERE PatientId = prm_PatientId;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(vEmergencyCaseId, prm_PatientId);

SELECT vReleaseId, vSuccess AS success, vSocketEndPoint AS socketEndPoint;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTeam !!
DELIMITER $$
CREATE PROCEDURE  AAU.sp_InsertTeam(
IN prm_TeamName varchar(64),
IN prm_Colour varchar(7),
IN prm_Capacity INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to inseret a team

Modified By: Ankit Singh
Created On: 03/02/2021
Purpose: Used to inseret a team with colour
*/
DECLARE vTeamExists INT;
DECLARE vTeamId INT;
DECLARE vSuccess INT;

SET vTeamId = 0;
SET vTeamExists = 0;

SELECT COUNT(1) INTO vTeamExists FROM AAU.Team WHERE TeamName = prm_TeamName;

IF vTeamExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Team 
		(
	TeamName, 
	Capacity,
    TeamColour
		) 
		VALUES (
	prm_TeamName, 
	prm_Capacity,
    prm_Colour
		);

    	SELECT LAST_INSERT_ID() INTO vTeamId;
    	SELECT 1 INTO vSuccess;

COMMIT;

	ELSEIF vTeamExists > 0 THEN
		SELECT 2 INTO vSuccess;
	ELSE
		SELECT 3 INTO vSuccess;
	END IF;
SELECT vTeamId, vSuccess;
END$$
DELIMITER ;
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
                                    IN prm_Age INT)
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
                Age					= prm_Age
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

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_Position INT,
									IN prm_AnimalTypeId INT,									
                                    IN prm_AddToStreetTreat INT,
                                    IN prm_IsDeleted INT,
                                    IN prm_TagNumber VARCHAR(45),
                                    OUT prm_OutTagNumber VARCHAR(45),
                                    OUT prm_OutPatientId INT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a patient.
*/

DECLARE vOrganisationId INT;
DECLARE vTeamId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vPatientExists INT;
DECLARE vExistingTagNumber VARCHAR(45);
DECLARE vCaseId INT;

SET vPatientExists = 0;
SET vStreetTreatCaseExists = 0;

SELECT prm_PatientId INTO prm_OutPatientId;

SELECT prm_TagNumber INTO prm_OutTagNumber;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND Position = prm_Position;

SELECT TagNumber INTO vExistingTagNumber FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

	UPDATE AAU.Patient SET
			Position		= prm_Position,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= prm_TagNumber,
            IsDeleted		= prm_IsDeleted,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END
								
	WHERE PatientId = prm_PatientId;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update', NOW());
               
    SELECT 1 INTO prm_Success;  
		
        IF prm_AddToStreetTreat = 0 THEN
			
         SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;  
         
			IF vStreetTreatCaseExists = 1 THEN
				UPDATE AAU.Patient SET TagNumber = NULL WHERE PatientId = prm_PatientId;
                
                DELETE FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId 
                AND StreetTreatCaseId NOT IN (
					SELECT StreetTreatCaseId FROM AAU.Visit
                );
			
            END IF;
            
            
		END IF;
    
		IF prm_AddToStreetTreat = 1 THEN
		
		SELECT TeamId INTO vTeamId FROM AAU.Team WHERE TeamName = 'Team Vinod';
		
		-- If we already have a tag number, then assume we should be using that, otherwise generate the next biggest tag number
		IF prm_TagNumber IS NULL OR prm_TagNumber = '' THEN
		
			SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO prm_TagNumber
			FROM AAU.Patient
			WHERE TagNumber LIKE 'ST%';
		
		END IF;
		
        -- Check that our case doesn't already exist
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Patient WHERE tagNumber = prm_TagNumber;        
        
        -- Check if we're updating the tag number and then push that change through to Street Treat        
        IF prm_TagNumber <> vExistingTagNumber AND vStreetTreatCaseExists = 1 THEN
        
        UPDATE AAU.Patient SET TagNumber = prm_TagNumber WHERE TagNumber = vExistingTagNumber;
        
		INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update tag - new tag: ' + prm_TagNumber, NOW());
		
        -- Otherwise it's a new case and we need to add it
		ELSEIF vStreetTreatCaseExists = 0 THEN
		
			INSERT INTO AAU.StreetTreatCase (PatientId,PriorityId,StatusId,TeamId,MainProblemId,AdminComments)
				VALUES(prm_OutPatientId, 2, 1, vTeamId, 6, 'Added by Apoms');   
			
            SELECT LAST_INSERT_ID() INTO vCaseId;
    
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = prm_TagNumber WHERE PatientId = prm_PatientId;
            
            SELECT prm_TagNumber INTO prm_OutTagNumber;
			
		END IF;
    
    END IF;
    
ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateReleaseRequest !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateReleaseRequest(IN prm_UserName VARCHAR(45),
											IN prm_EmergencyCaseId INT,
											IN prm_ReleaseId INT,
											IN prm_ComplainerNotes NVARCHAR(450),
											IN prm_ComplainerInformed TINYINT,
											IN prm_Releaser1Id INT,
											IN prm_Releaser2Id INT,
											IN prm_RequestedUser NVARCHAR(45),
											IN prm_RequestedDate DATE
											)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: Used to update a release of a patient.
*/

DECLARE vUpdateSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vPatientId INT;
DECLARE vUserId INT;
DECLARE vSocketEndPoint CHAR(3);

SELECT COUNT(1), MAX(PatientId) INTO vReleaseCount, vPatientId FROM AAU.ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT u.UserId, o.SocketEndPoint INTO vUserId, vSocketEndPoint 
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_RequestedUser LIMIT 1;

IF vReleaseCount = 1 THEN

UPDATE AAU.ReleaseDetails 
				SET	ComplainerNotes = prm_ComplainerNotes,
                    ComplainerInformed = IF(prm_ComplainerInformed,1,0),
                    Releaser1Id = prm_Releaser1Id,
                    Releaser2Id = prm_Releaser2Id,
                    RequestedUser = vUserId,
                    RequestedDate = prm_RequestedDate
WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT 1 INTO vUpdateSuccess;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_UserName,prm_ReleaseId,'Release','Update', NOW());

ELSEIF vReleaseCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- Release Doesn't exist

ELSEIF vReleaseCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

END IF;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, vPatientId);

SELECT vUpdateSuccess AS success, vSocketEndPoint AS socketEndPoint;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTeamById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateTeamById(
										IN prm_TeamId INT,
										IN prm_TeamName NVARCHAR(64),
										IN prm_Capacity NVARCHAR(64),
                                        IN prm_Colour NVARCHAR(7),
                                        IN prm_IsDeleted TINYINT(1)
                                        )
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 24/08/2018
Purpose: Used to update a team by id.
*/

DECLARE vTeamCount INT;
DECLARE vTeamNameCount INT;
DECLARE vSuccess INT;

SET vTeamCount = 0;
SET vTeamNameCount = 0;

SELECT COUNT(1) INTO vTeamCount FROM AAU.Team WHERE TeamId = prm_TeamId;

SELECT COUNT(1) INTO vTeamNameCount FROM AAU.Team WHERE TeamId <> prm_TeamId AND TeamName = prm_TeamName;

IF vTeamCount = 1 AND vTeamNameCount = 0 THEN

	UPDATE AAU.Team
		SET	TeamName	= prm_TeamName,
			Capacity	= prm_Capacity,
            TeamColour	= prm_Colour,
            IsDeleted   = prm_IsDeleted
	WHERE TeamId = prm_TeamId;

	SELECT 1 INTO vSuccess; -- Team update OK.

	ELSEIF vTeamCount = 0 THEN

	SELECT 2 INTO vSuccess; -- Team Doesn't exist

	ELSEIF vTeamCount > 1 THEN

	SELECT 3 INTO vSuccess; -- Multiple records, we have duplicates
    
    ELSEIF vTeamNameCount >= 1 THEN
    
    SELECT 4 INTO vSuccess; -- Team name already exists

	ELSE

	SELECT 4 INTO vSuccess; -- Return misc 

	END IF;
	
SELECT vSuccess;

END$$


DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitTeamByTeamId !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVisitTeamByTeamId(
	IN prm_StreetTreatCaseId INT,
    IN prm_TeamId INT
)
BEGIN
/*

Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Update Visit Team.

*/
DECLARE vStreetTreatCaseIdExists INT;
DECLARE vSuccess INT;

SELECT count(1) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE StreetTreatCaseId = prm_StreetTreatCaseId;

IF vStreetTreatCaseIdExists > 0 THEN

	UPDATE AAU.StreetTreatCase
	SET
	TeamId = prm_TeamId
	WHERE StreetTreatCaseId = prm_StreetTreatCaseId;
    SELECT 1 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END$$
DELIMITER ;
