DELIMITER !!
DROP FUNCTION IF EXISTS AAU.fn_GetRescueStatus !!

DELIMITER $$
CREATE FUNCTION AAU.fn_GetRescueStatus(
	ReleaseDetailsId INT,
	RequestedUser VARCHAR(45),
    RequestedDate Date,
    Releaser1Id INT,
    Releaser2Id INT,
    PickupDate DATE,
    BeginDate DATE,
    EndDate DATE,
	  Rescuer1Id INT,
    Rescuer2Id INT,
    AmbulanceArrivalTime DATETIME,
    RescueTime DATETIME,
    AdmissionTime DATETIME,
    CallOutcomeId INT,
    InTreatmentAreaId INT
) RETURNS int(11)
    DETERMINISTIC
BEGIN
    DECLARE rescueReleaseStatus INT;

		IF
			(Rescuer1Id IS NULL AND
			Rescuer2Id IS NULL AND
            CallOutcomeId IS NULL AND
            ReleaseDetailsId IS NULL AND
            RequestedUser IS NULL AND
            RequestedDate IS NULL)
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
            CallOutcomeId IS NOT NULL AND
			ReleaseDetailsId IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            Releaser1Id IS NULL)
			THEN SET rescueReleaseStatus = 1;

        ELSEIF
			(Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL)
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            Releaser1Id IS NOT NULL AND
            PickupDate IS NULL
            -- EndDate IS NULL
            )
			THEN SET rescueReleaseStatus = 2;

		ELSEIF
			(Rescuer1Id IS NOT NULL AND
            Rescuer2Id IS NOT NULL AND
            AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL)
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            Releaser1Id IS NOT NULL AND
            PickupDate IS NOT NULL AND
            BeginDate IS NULL
            )
			THEN SET rescueReleaseStatus = 3;
		ELSEIF
			(Rescuer1Id IS NOT NULL AND
            Rescuer2Id IS NOT NULL AND
            RescueTime IS NOT NULL AND
			AdmissionTime IS NULL AND
			ReleaseDetailsId IS NULL)
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            Releaser1Id IS NOT NULL AND
            PickupDate IS NOT NULL AND
            BeginDate IS NOT NULL AND
            EndDate IS NULL)
			THEN SET rescueReleaseStatus = 4;

		ELSEIF
			(Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NULL  AND
				(
				CallOutcomeId IS NULL OR
				InTreatmentAreaId IS NULL
				)
            )
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            Releaser1Id IS NOT NULL AND
            PickupDate IS NOT NULL AND
            BeginDate IS NOT NULL AND
            EndDate IS NULL)
			THEN SET rescueReleaseStatus = 5;


        END IF;

	-- return the rescue status
	RETURN (rescueReleaseStatus);
END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_ETL_DailyStats_Full !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_ETL_DailyStats_Full()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 02/02/2021
Purpose: Used to load the full history of metrics
*/

SELECT c.OrganisationId, c.AnimalType, c.Date, c.Calls, c.Admissions, c.`ReferredToStreetTreat`,
c.`RescueNotNeeded`,
c.`AnimalDied`,
c.`RescuedResolvedOnSite`,
c.`UnableToFindCatchAnimal`,
c.`CallerNotReachable`,
c.`SameAs`,
c.`NotComplete`,
c.`DiedInAmbulance`,
c.Rescues,
IFNULL(p.Released, 0) AS `Released`,
IFNULL(p.Died, 0) AS `Died`,
IFNULL(sst.Spays, 0) AS `Spays`,
IFNULL(sst.Neuters, 0) AS `Neuters`,
IFNULL(sst.OtherSurgeries, 0) AS `OtherSurgeries`
FROM
(
SELECT	ec.OrganisationId,
		p.AnimalTypeId,
        aty.AnimalType,
		CAST(ec.CallDateTime AS DATE) AS `Date`,
        COUNT(DISTINCT ec.EmergencyNumber) AS `Calls`,
        SUM(CASE WHEN p.PatientCallOutcomeId = 1 THEN 1 ELSE 0 END) AS `Admissions`,
        SUM(CASE WHEN p.PatientCallOutcomeId = 18 THEN 1 ELSE 0 END) AS `ReferredToStreetTreat`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (3,4,7,14) THEN 1 ELSE 0 END) AS `RescueNotNeeded`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (2,11) THEN 1 ELSE 0 END) AS `AnimalDied`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (15,6,13,9,5,19) THEN 1 ELSE 0 END) AS `RescuedResolvedOnSite`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (17,12) THEN 1 ELSE 0 END) AS `UnableToFindCatchAnimal`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (8) THEN 1 ELSE 0 END) AS `CallerNotReachable`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (16) THEN 1 ELSE 0 END) AS `SameAs`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (20) THEN 1 ELSE 0 END) AS `NotComplete`,
		SUM(CASE WHEN p.PatientCallOutcomeId IN (10) THEN 1 ELSE 0 END) AS `DiedInAmbulance`,
        SUM(CASE WHEN co.IsRescue = 1 THEN 1 ELSE 0 END) AS `Rescues`
FROM AAU.EmergencyCase ec
        INNER JOIN AAU.Patient p		ON p.EmergencyCaseId	= ec.EmergencyCaseId
        INNER JOIN AAU.AnimalType aty	ON aty.AnimalTypeId		= p.AnimalTypeId
        LEFT JOIN AAU.CallOutcome co	ON co.CallOutcomeId		= p.PatientCallOutcomeId
WHERE ec.CallDateTime >= '2019-01-01'
GROUP BY ec.OrganisationId,
CAST(ec.CallDateTime AS DATE),
p.AnimalTypeId,
aty.AnimalType
) c
LEFT JOIN
(
			SELECT	p.OrganisationId,
					p.AnimalTypeId,
					p.PatientStatusDate AS `Date`,
					SUM(CASE WHEN p.PatientStatusId = 2 THEN 1 ELSE 0 END) AS `Released`,
					SUM(CASE WHEN p.PatientStatusId = 3 THEN 1 ELSE 0 END) AS `Died`
			FROM AAU.Patient p
			GROUP BY p.OrganisationId, p.AnimalTypeId, p.PatientStatusDate
) p ON p.AnimalTypeId = c.AnimalTypeId
AND p.Date = c.Date
AND p.OrganisationId = c.OrganisationId
LEFT JOIN
(
SELECT p.OrganisationId, p.AnimalTypeId, CAST(s.SurgeryDate AS DATE) AS `Date`,
SUM(CASE WHEN s.SurgeryTypeId = 1 THEN 1 ELSE 0 END) AS `Spays`,
SUM(CASE WHEN s.SurgeryTypeId = 2 THEN 1 ELSE 0 END) AS `Neuters`,
SUM(CASE WHEN s.SurgeryTypeId NOT IN (1,2) THEN 1 ELSE 0 END) AS `OtherSurgeries`
FROM AAU.Surgery s
INNER JOIN AAU.Patient p ON p.PatientId = s.PatientId
GROUP BY p.OrganisationId, p.AnimalTypeId, CAST(s.SurgeryDate AS DATE)
) sst ON sst.OrganisationId = c.OrganisationId
AND sst.Date = c.Date
AND sst.AnimalTypeId = c.AnimalTypeId;

END$$
DELIMITER ;


DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithNoVisits!!
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
        ec.EmergencyCaseId,
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
          'Priority', rawData.Priority,
          'PatientId',rawData.PatientId,
          'EmergencyCaseId',rawData.EmergencyCaseId
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

DROP PROCEDURE IF EXISTS AAU.sp_GetCaseById !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetCaseById( IN prm_streetTreatCaseId INT, OUT Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return a case by ID.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
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
		p.Description AS AnimalName,
		ec.Name AS ComplainerName,
		ec.Number AS ComplainerNumber,
		ec.Location AS Address,
		ec.Latitude,
		ec.Longitude,
		c.AdminComments AS AdminNotes,
		c.OperatorNotes,
        p.PatientStatusDate AS ReleasedDate,
        c.ClosedDate,
        te.IsIsolation,
        c.EarlyReleaseFlag,
		c.IsDeleted,
        c.MainProblemId
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
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN
		(
		SELECT TagNumber, TRUE AS IsIsolation
		FROM AAU.TreatmentList t
		INNER JOIN AAU.TreatmentArea ta ON ta.AreaId = t.AreaId
		WHERE ta.Area LIKE '%ISO%'
		) te ON te.TagNumber = p.TagNumber
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
		MIN(Date) AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
WHERE c.StreetTreatCaseId = prm_streetTreatCaseId;

SELECT 1 INTO Success;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusByTagNumber !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusByTagNumber(IN prm_UserName VARCHAR(45), IN prm_TagNumber VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 10/08/2020
Purpose: Fetches census data for census table in hospital manager tab
*/

SELECT
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE
		(
			JSON_OBJECT("date" ,tl.InDate),
			JSON_OBJECT("area" ,ta.Area),
			JSON_OBJECT("action" , "Moved in"),
			JSON_OBJECT("days" , DATEDIFF(IFNULL(OutDate, CURDATE()), InDate)),
			JSON_OBJECT("order" , tl.TreatmentListId)
		)
) AS Census
FROM AAU.TreatmentList tl
INNER JOIN AAU.Patient p ON p.PatientId = tl.PatientId AND p.TagNumber = prm_TagNumber
INNER JOIN AAU.TreatmentArea ta ON ta.AreaId = tl.InTreatmentAreaId;

END$$
DELIMITER ;
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
			AND p.PatientCallOutcomeId =1
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

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusPatientCount(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 9/09/20
Purpose: Get the total count of animals in each area.
*/


WITH TotalAreaCount
AS
(SELECT
DataCount.Area,
COUNT(1) AS TotalCount
FROM
(SELECT CASE  WHEN at.AnimalTypeId IN (5,10) THEN LatestArea.Area
			WHEN at.AnimalTypeId IN (3,8) THEN 'Cat area'
			WHEN at.AnimalTypeId IN (1,2,4,6,12,13,18,32) THEN IFNULL(LatestArea.Area, 'Large animal hospital')
			WHEN at.AnimalTypeId IN (7,11,17,27) THEN 'Sheep area'
			WHEN at.AnimalTypeId IN (14,16,22,23,25) THEN 'Bird treatment area'
			ELSE 'Other'
            END AS Area
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
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
AND p.PatientCallOutcomeId = 1
 )
DataCount
GROUP BY DataCount.Area),
TotalAnimalCount AS (SELECT SUM(totalCount) as TotalCount from TotalAreaCount)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("area" , data.Area),
JSON_OBJECT("count" , data.totalCount))) as PatientCountData
FROM(
SELECT Area, TotalCount FROM TotalAreaCount tc
UNION ALL
SELECT "Total" , TotalCount FROM TotalAnimalCount tac)data;


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
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
INNER JOIN AAU.PatientProblem pp ON pp.PatientId = p.PatientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
WHERE CAST(ec.CallDateTime AS DATE) = prm_Date
AND ec.OrganisationId = vOrganisationId
AND (p.PatientCallOutcomeId = prm_Outcome OR prm_Outcome IS NULL);



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
JSON_OBJECT("caseComments", ec.Comments)

) AS Result

FROM AAU.EmergencyCase ec
LEFT JOIN AAU.EmergencyCode c ON c.EmergencyCodeId = ec.EmergencyCodeId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetJobType !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetJobType(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 27/10/2020
Purpose: To get the UserjobType data for dropdown.
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User
WHERE Username = prm_Username;


SELECT DISTINCT jt.JobTypeId , jt.Title
FROM AAU.JobType jt
WHERE jt.OrganisationId = vOrganisationId ;

END$$
DELIMITER ;


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetMainProblem !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetMainProblem(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 08/05/2019
Purpose: Used to return list of main problems for cases.
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User
WHERE Username = prm_Username;

SELECT MainProblemId, MainProblem
FROM AAU.MainProblem
WHERE OrganisationId = vOrganisationId ;

END$$
DELIMITER ;

DROP procedure IF EXISTS AAU.sp_GetMediaItemsByPatientId;

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetMediaItemsByPatientId(IN prm_PatientId INT)
BEGIN

/*****************************************
Author: Jim Mackenzie
Date: 23/07/2020
Purpose: To retrieve Media items for a patient


Modified By: Ankit Singh
Date: 25-04-2021
Purpose: Comment with User

*****************************************/

/*
Updated By: Arpit Trivedi
Date: 9-11-20
Purpose: Added the date format in the datetime field.
*/

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("mediaItemId", PatientMediaItemId),
JSON_OBJECT("mediaType", MediaType),
JSON_OBJECT("localURL", NULL),
JSON_OBJECT("isPrimary" , isPrimary),
JSON_OBJECT("remoteURL", URL),
JSON_OBJECT("datetime", DATE_FORMAT(DateTime , "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("heightPX", HeightPX),
JSON_OBJECT("widthPX", WidthPX),
Tags
)
) AS Result
FROM AAU.PatientMediaItem pmi
WHERE pmi.PatientId= prm_PatientId;

END$$
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

Updated By: Arpit Trivedi
Date: 28/04/2021
Purpose: Moved the Outcome to the patient level so now it will retrieve the rescues and releases on the patient call outcome.

Updated By: Jim Mackenzie
Date: 28/04/2021
Purpose: Altering status based upon whether the admission area has been added

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
        p.PatientCallOutcomeId,
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
        p.PatientCallOutcomeId
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
																p.PatientCallOutcomeId,
                                                                tl.InTreatmentAreaId
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
            JSON_OBJECT("callOutcomeId", p.PatientCallOutcomeId),
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
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencycaseId = p.EmergencycaseId
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
) ca ON ca.EmergencycaseId = ec.EmergencyCaseId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = rd.PatientId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
LEFT JOIN AAU.User rl1 ON rl1.UserId = rd.Releaser1Id
LEFT JOIN AAU.User rl2 ON rl2.UserId = rd.Releaser2Id
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutstandingRescues(IN prm_UserName VARCHAR(45))
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
FROM  AAU.Patient p
WHERE p.OrganisationId = 1
AND p.PatientCallOutcomeId IS NULL
AND p.IsDeleted = 0

UNION

SELECT PatientId
FROM AAU.ReleaseDetails rd
WHERE rd.OrganisationId = 1
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
UserCTE AS
(
	SELECT UserId, Initials
	FROM AAU.User
),
PatientsCTE AS
(
    SELECT
		p.EmergencyCaseId,
        MAX(p.PatientCallOutcomeId) AS `PatientCallOutcomeId`,
        IFNULL(rd.PatientId, p.EmergencyCaseId) AS `PatientId`, -- Tricking the query to group rescues together, but keep releases apart.
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("PatientCallOutcomeId", p.PatientCallOutcomeId),
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
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescuesReleases)
    GROUP BY p.EmergencyCaseId,
    IFNULL(rd.PatientId, p.EmergencyCaseId)
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
                p.PatientCallOutcomeId,
                tl.InTreatmentAreaId
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
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND Admission = 1
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
LEFT JOIN UserCTE s1 ON s1.UserId = ag.Staff1Id
LEFT JOIN UserCTE s2 ON s2.UserId = ag.Staff2Id
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

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallerInteractionByPatientId !!
DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallsByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientCallerInteractionByPatientId( IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/04/2020
Purpose: Used to return a Patient Calls by Patient ID.
*/

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("patientId", pc.PatientId),
JSON_OBJECT("calls",
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("patientCallerInteractionId", pc.PatientCallerInteractionId),

JSON_OBJECT("callType",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallTypeId", pc.CallTypeId),
JSON_OBJECT("CallType", ct.CallType)
)),
JSON_OBJECT("doneBy",JSON_MERGE_PRESERVE(
JSON_OBJECT("UserId", pc.DoneByUserId),
JSON_OBJECT("FirstName", u.Firstname)
)),
JSON_OBJECT("callDateTime", DATE_FORMAT(pc.CallDateTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientCallerInteractionOutcomeId", pc.PatientCallerInteractionOutcomeId),
JSON_OBJECT("positiveInteraction", pc.PositiveInteraction),
JSON_OBJECT("comments", pc.Comments),
JSON_OBJECT("createdBy", pc.CreatedBy),
JSON_OBJECT("createdDateTime", DATE_FORMAT(pc.CreatedDateTime, "%Y-%m-%dT%H:%i:%s")),

JSON_OBJECT("updated", false)
)))) Result

FROM AAU.PatientCallerInteraction pc
INNER JOIN AAU.CallType ct ON ct.CallTypeId = pc.CallTypeId
INNER JOIN AAU.User u ON u.UserId = pc.DoneByUserId
WHERE pc.PatientId = prm_PatientId;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallerInteractionOutcomes !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallOutcomes !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientCallerInteractionOutcomes(IN prm_Username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientCallerInteractionOutcomeId, PatientCallerInteractionOutcome FROM AAU.PatientCallerInteractionOutcome WHERE OrganisationId = vOrganisationId AND IsDeleted = 0;

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
AND p.PatientCallOutcomeId = 1
),
EmergencyCaseCTE AS (
SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)
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
		tl.PatientId,
		ta.Area
	FROM AAU.TreatmentList tl
	INNER JOIN AAU.TreatmentArea ta ON ta.AreaId = tl.InTreatmentAreaId
    WHERE OutOfHospital IS NULL
    AND OutDate IS NULL
) LatestArea ON LatestArea.PatientId = p.PatientId
WHERE COALESCE(LatestArea.Area, AAU.fn_GetAreaForAnimalType(vOrganisationId, p.AnimalTypeId), 'Other') = prm_Area;



END$$
DELIMITER ;
DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetPatientMediaComments!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientMediaComments(IN prm_PatientMediaItemId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientMediaItem record.


Created: Ankit Singh
Modified On: 04/05/2021
Purpose: removed comment column
*/
SELECT
	JSON_ARRAYAGG(
		JSON_OBJECT(
			"userId",pmc.UserId,
			"userColour",COALESCE(u.Colour,'#607d8b'),
			"userInitials",IF(u.Initials IS NULL, CONCAT(LEFT(u.Firstname,1), COALESCE(LEFT(u.Surname,1),'')), u.Initials),
			"userName",u.UserName,
			"comment",pmc.Comment,
			"timestamp",pmc.timestamp
		)
	) AS Result
FROM AAU.PatientMediaComments pmc
LEFT JOIN AAU.User u ON u.UserId = pmc.UserId
WHERE pmc.PatientMediaItemId = prm_PatientMediaItemId;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRescueDetailsByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRescueDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
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
JSON_OBJECT("code", ec.EmergencyCodeId),
JSON_OBJECT("updateTime", DATE_FORMAT(ec.UpdateTime, "%Y-%m-%dT%H:%i:%s"))
)),
JSON_OBJECT("rescueDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("rescuer1Id", ec.Rescuer1Id),
JSON_OBJECT("rescuer1Abbreviation", r1.Initials),
JSON_OBJECT("rescuer1Colour", r1.Colour),
JSON_OBJECT("rescuer2Id", ec.Rescuer2Id),
JSON_OBJECT("rescuer2Abbreviation", r2.Initials),
JSON_OBJECT("rescuer2Colour", r2.Colour),
JSON_OBJECT("ambulanceArrivalTime", DATE_FORMAT(ec.AmbulanceArrivalTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_FORMAT(ec.RescueTime, "%Y-%m-%dT%H:%i:%s"))
))

) AS Result

FROM AAU.EmergencyCase ec
LEFT JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
LEFT JOIN AAU.CallOutcome c ON c.CallOutcomeId = p.PatientCallOutcomeId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientsByEmergencyCaseId !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return all patients for a case by EmergencyCaseId

Modified By: Jim Mackenzie
Modified On: 27/04/2021
Purpose: Moving the check for call outcome to patient and adding in admission acceptance flag.


*/


With PatientCTE AS (
	SELECT PatientId FROM AAU.Patient WHERE EmergencyCaseId = prm_emergencyCaseId AND IsDeleted = 0
)

SELECT
JSON_OBJECT(
	"patients",
	 JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("patientId", p.PatientId),
			JSON_OBJECT("position", p.Position),
			JSON_OBJECT("tagNumber", p.TagNumber),
			JSON_OBJECT("animalTypeId", p.AnimalTypeId),
			JSON_OBJECT("animalType", at.AnimalType),
			JSON_OBJECT("updated", false),
			JSON_OBJECT("deleted", p.IsDeleted),
			JSON_OBJECT("duplicateTag", false),
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InTreatmentAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",saec.EmergencyNumber)
                )
            ),
            pp.problemsJSON,
            pp.problemsString
			)
		 )
) AS Result

FROM  AAU.Patient p
INNER JOIN
	(
	SELECT pp.patientId, JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
				JSON_OBJECT("problemId", pp.ProblemId),
				JSON_OBJECT("problem", pr.Problem)
				)
			 )
		) AS problemsJSON,
        JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS ProblemsString
	FROM AAU.PatientProblem pp
	INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
    WHERE pp.PatientId IN (SELECT PatientId FROM PatientCTE)
	GROUP BY pp.patientId
	) pp ON pp.patientId = p.patientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.EmergencyCase saec ON saec.EmergencyCaseId = p.SameAsEmergencyCaseId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
GROUP BY p.EmergencyCaseId;

END$$
DELIMITER ;
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

Modified By: Ankit Singh
Modified On: 18/04/2021
Purpose: For Null Data Checking
*/


DECLARE vReleaseDetailsIdExists INT;
DECLARE vStreetTreatCaseIdExists INT;
SELECT COUNT(ReleaseDetailsId) INTO vReleaseDetailsIdExists FROM AAU.ReleaseDetails WHERE PatientId=prm_PatientId;
SELECT COUNT(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE PatientId=prm_PatientId;


IF vStreetTreatCaseIdExists >= 0 AND vReleaseDetailsIdExists > 0 THEN
SELECT
	JSON_OBJECT( 
		"releaseId",rd.ReleaseDetailsId,
		"patientId",rd.PatientId,
		"releaseRequestForm",
			JSON_OBJECT(
				"requestedUser",u.UserName, 
				"requestedDate",DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")
			), 
		"complainerNotes",rd.ComplainerNotes,
		"complainerInformed",rd.ComplainerInformed,
		"Releaser1",rd.Releaser1Id, 
		"Releaser2",rd.Releaser2Id, 
		"releaseBeginDate",DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"), 
		"releaseEndDate",DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")
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
ELSE
	SELECT null AS Result;
END IF;
END$$

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
			WHEN p.PatientCallOutcomeId = 18 THEN
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
		FROM AAU.TreatmentList tl
        INNER JOIN AAU.Patient p ON p.PatientId = tl.PatientId
		INNER JOIN AAU.TreatmentArea ta ON ta.AreaId = tl.InTreatmentAreaId
		WHERE ta.Area LIKE '%ISO%'
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

DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatWithVisitDetailsByPatientId!!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatWithVisitDetailsByPatientId(IN prm_PatientId INT)
BEGIN
DECLARE vStreetTreatCaseIdExists INT;
/*
Created By: Ankit Singh
Created On: 23/02/2020
Purpose: Used to fetch streettreat case with visits by patient id
*/



SELECT COUNT(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE PatientId=prm_PatientId;


IF vStreetTreatCaseIdExists > 0 THEN
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
                    "patientReleaseDate",IF(p.PatientStatusId = 8, p.PatientStatusDate, null),
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
        LEFT JOIN AAU.Patient p ON p.PatientId = s.PatientId
	WHERE
		s.PatientId =  prm_PatientId
	GROUP BY s.StreetTreatCaseId;
ELSE
	SELECT null AS Result;
END IF;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusPatientCount !!
DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentAreaPatientCount !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentAreaPatientCount(IN prm_UserName VARCHAR(45))
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
		tl.PatientId,
		ta.Area
	FROM AAU.TreatmentList tl
	INNER JOIN AAU.TreatmentArea ta ON ta.AreaId = tl.InTreatmentAreaId
    WHERE OutOfHospital IS NULL
    AND OutDate IS NULL
) LatestArea ON LatestArea.PatientId = p.PatientId
WHERE p.PatientStatusId IN (1,7)
AND p.IsDeleted = 0
AND p.PatientCallOutcomeId = 1
 )
DataCount
GROUP BY DataCount.Area)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("area" , data.Area),
JSON_OBJECT("sortArea" , data.SortArea),
JSON_OBJECT("lowPriority" , LowPriority),
JSON_OBJECT("normalPriority" , NormalPriority),
JSON_OBJECT("highPriority" , HighPriority),
JSON_OBJECT("infants" , Infants),
JSON_OBJECT("adults" , Adults),
JSON_OBJECT("count" , data.TotalCount))) as PatientCountData
FROM
(
SELECT tc.Area, IFNULL(ta.SortArea,999) AS `SortArea`, tc.LowPriority, tc.NormalPriority, tc.HighPriority, tc.Infants, tc.Adults, tc.TotalCount
FROM TotalAreaCount tc
LEFT JOIN AAU.TreatmentArea ta ON ta.Area = tc.Area
UNION ALL
SELECT "Total", 999, 0, 0, 0, 0, 0, SUM(TotalCount) FROM TotalAreaCount
) data;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentAreas!!

-- CALL AAU.sp_GetTreatmentAreas('Jim');

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetTreatmentAreas(IN prm_UserName VARCHAR(45))
BEGIN

/*
Developer: Jim Mackenzie
Development Date: 28/Mar/2021
Purpose: This procedure brings back the Treatment areas for the treatment list. The lists
		 are split into main areas and areas that will display in the 'other' section.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("areaId", AreaId),
	JSON_OBJECT("areaName", Area),
    JSON_OBJECT("sortArea", SortArea),
    JSON_OBJECT("abbreviation", Abbreviation),
    JSON_OBJECT("mainArea", TreatmentListMain)
	)) TreatmentAreas
FROM AAU.TreatmentArea
WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentList !!

DELIMITER $$

-- CALL AAU.sp_GetTreatmentList(5, '2021-05-05');

CREATE PROCEDURE AAU.sp_GetTreatmentList ( IN prm_TreatmentAreaId INT, IN prm_TreatmentListDate DATE )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

WITH PatientCTE AS (
	SELECT p.EmergencyCaseId, p.PatientId, p.PatientStatusId, ps.PatientStatus, p.PatientStatusDate, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament, p.Age,
	p.Sex, p.Description, p.KnownAsName, p.MainProblems,
	CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END AS `ReleaseReady`
	FROM AAU.Patient p
	INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
	WHERE p.PatientId IN (SELECT PatientId FROM AAU.TreatmentList WHERE NULLIF(OutAccepted,0) IS NULL AND InTreatmentAreaId = prm_TreatmentAreaId)
	AND IFNULL(p.PatientStatusDate, prm_TreatmentListDate) = IF(p.PatientStatusId > 1, prm_TreatmentListDate, IFNULL(p.PatientStatusDate, prm_TreatmentListDate))
	AND p.PatientCallOutcomeId = 1
),
EmergencyCaseCTE AS (
	SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
	FROM AAU.EmergencyCase ec
	WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)
),
RecordSplitCTE AS
(
SELECT
CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admissions'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'moved in from'
WHEN tl.OutAccepted = 0 THEN 'rejected from'
ELSE 'accepted' END AS `RecordType`,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListId" , tl.TreatmentListId),
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("PatientStatusId" , p.PatientStatusId),
JSON_OBJECT("PatientStatus" , p.PatientStatus),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Age" , p.Age),
JSON_OBJECT("Sex" , p.Sex),
JSON_OBJECT("Description" , p.Description),
JSON_OBJECT("Main Problems" , p.MainProblems),
JSON_OBJECT("animalTypeId" , p.animalTypeId),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , ec.CallDateTime),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Known as name", p.KnownAsName),
JSON_OBJECT("Release ready", p.ReleaseReady),
JSON_OBJECT("Actioned by area", ca.`Area`),
JSON_OBJECT("Moved to", IF(tl.OutAccepted IS NULL AND tl.OutTreatmentAreaId IS NOT NULL, tl.OutTreatmentAreaId, NULL)),
JSON_OBJECT("Admission", IF(tl.Admission = 1 AND InAccepted IS NULL, 1, 0)), -- This prevents records showing up in new admissions the first move.
JSON_OBJECT("Move accepted", tl.InAccepted),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails
FROM PatientCTE p
	INNER JOIN EmergencyCaseCTE ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN
    (
		SELECT InAccepted, Admission, PatientId, TreatmentListId, OutOfHospital, InTreatmentAreaId, InDate,
        OutTreatmentAreaId, OutAccepted, OutDate,
		IF(OutAccepted = 0, OutTreatmentAreaId,IFNULL(LAG(InTreatmentAreaId, 1) OVER (PARTITION BY PatientId ORDER BY TreatmentListId), OutTreatmentAreaId)) as `ActionedByArea`
		FROM AAU.TreatmentList tld
        WHERE (prm_TreatmentListDate <= IFNULL(CAST(IF(OutAccepted IS NULL, NULL, OutDate) AS DATE), prm_TreatmentListDate)
        AND CAST(InDate AS DATE) <= prm_TreatmentListDate)
    ) tl ON tl.PatientId = p.PatientId
    AND NULLIF(OutAccepted, 0) IS NULL
    AND InTreatmentAreaId = prm_TreatmentAreaId
    AND
		(
			OutOfHospital IS NULL
			OR
			CAST(p.PatientStatusDate AS DATE) = prm_TreatmentListDate
		)
	INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
	INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
    LEFT JOIN AAU.TreatmentArea ca ON ca.AreaId = tl.ActionedByArea
	LEFT JOIN
	(
		SELECT DISTINCT t.PatientId
		FROM AAU.Treatment t
		WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
	) t ON t.PatientId = p.PatientId
GROUP BY CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admissions'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'moved in from'
WHEN tl.OutAccepted = 0 THEN 'rejected from'
ELSE 'accepted' END
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListType",RecordType),
JSON_OBJECT("treatmentList",patientDetails)
)) AS `TreatmentList`
FROM RecordSplitCTE;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUsersByIdRange !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetUsersByIdRange()
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.
*/

SELECT

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("userId",UserDetails.UserId),
JSON_OBJECT("firstName",UserDetails.FirstName),
JSON_OBJECT("surName",UserDetails.Surname),
JSON_OBJECT("initials",UserDetails.Initials),
JSON_OBJECT("colour",UserDetails.Colour),
JSON_OBJECT("telephone",UserDetails.Telephone),
JSON_OBJECT("userName",UserDetails.UserName),
JSON_OBJECT("teamId",UserDetails.TeamId),
JSON_OBJECT("team",UserDetails.TeamName),
JSON_OBJECT("roleId",UserDetails.RoleId),
JSON_OBJECT("role",UserDetails.RoleName),
JSON_OBJECT("jobTitleId",UserDetails.JobTypeId),
JSON_OBJECT("jobTitle",UserDetails.JobTitle),
JSON_OBJECT("isDeleted",UserDetails.IsDeleted),
JSON_OBJECT("permissionArray",UserDetails.PermissionArray)
))  AS userDetails
FROM (SELECT u.UserId, u.FirstName, u.Surname, u.PermissionArray, u.Initials, u.Colour, u.Telephone,
			u.UserName, u.Password, t.TeamId, t.TeamName, r.RoleId , r.RoleName,jobTitle.JobTypeId, jobTitle.JobTitle, IF(u.IsDeleted, 'Yes', 'No')
            AS IsDeleted
		FROM AAU.User u
		LEFT JOIN AAU.Team t ON t.TeamId = u.TeamId
		LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
		LEFT JOIN (SELECT
					ujt.UserId,
					GROUP_CONCAT(jt.JobTypeId) AS JobTypeId,
					GROUP_CONCAT(jt.Title) AS JobTitle
					FROM AAU.UserJobType ujt
					INNER JOIN AAU.JobType jt ON jt.JobTypeId = ujt.JobTypeId
					Where ujt.IsDeleted = 0
                    GROUP BY ujt.UserId
					ORDER BY UserId ASC) jobTitle
	ON jobTitle.UserId = u.UserId
    WHERE u.UserId <> -1
    ORDER BY u.UserId ASC) UserDetails;

-- WHERE UserDetails.UserId BETWEEN prm_userIdStart AND prm_UserIdEnd;


END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertEmergencyCase !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertEmergencyCase(
																		IN prm_UserName VARCHAR(64),
                                    IN prm_GUID VARCHAR(128),
                                    IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
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
DECLARE DummyEmNo INT;
-- DECLARE vEmergencyNumber INT;
DECLARE vEmergencyCaseId INT;
DECLARE vSocketEndpoint VARCHAR(64);
DECLARE vSuccess INT;
SET vEmNoExists = 0;
SET vOrganisationId = 0;

IF prm_EmergencyNumber = -1 THEN

	SELECT (MIN(EmergencyNumber) - 1) INTO prm_EmergencyNumber
    FROM AAU.EmergencyCase;

END IF;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01'), MAX(EmergencyCaseId) INTO
vEmNoExists, vUpdateTime, vCurrentCaseId
FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_EmergencyNumber;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

START TRANSACTION ;

IF vEmNoExists = 0 THEN

-- LOCK TABLES AAU.EmergencyCase WRITE;

-- SELECT MAX(EmergencyNumber + 1) INTO vEmergencyNumber FROM AAU.EmergencyCase
-- WHERE OrganisationId = vOrganisationId FOR UPDATE;

INSERT INTO AAU.EmergencyCase
(
	OrganisationId,
	EmergencyNumber,
	CallDateTime,
	DispatcherId,
	EmergencyCodeId,
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
	prm_EmergencyNumber,
	prm_CallDateTime,
	prm_DispatcherId,
	prm_EmergencyCodeId,
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
    -- SELECT MAX(EmergencyNumber) INTO vEmergencyNumber FROM AAU.EmergencyCase;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3, vCurrentCaseId INTO vSuccess, vEmergencyCaseId; -- Already updated

ELSE
	SELECT 4 INTO vSuccess; -- Other error
    SELECT vCurrentCaseId INTO vEmergencyCaseId;
END IF;


SELECT vSuccess as success, vEmergencyCaseId, prm_EmergencyNumber AS vEmergencyNumber,vSocketEndPoint;

END$$

DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient !!

DELIMITER $$
CREATE PROCEDURE sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_Position INT,
IN prm_AnimalTypeId INT,
IN prm_TagNumber VARCHAR(45),
IN prm_PatientCallOutcomeId  INT,
IN prm_SameAsEmergencyNumber INT,
IN prm_TreatmentPriority INT,
IN prm_PatientStatusId INT,
IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagExists INT;
DECLARE vSuccess INT;
DECLARE vTagNumber VARCHAR(20);
DECLARE vSameAsEmergencyCaseId INT;

SET vPatientExists = 0;
SET vTagExists = 0;
SET vTagNumber = NULL;
SET vSameAsEmergencyCaseId = NULL;


SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position AND IsDeleted = 0;

SELECT COUNT(1) INTO vTagExists FROM AAU.Patient WHERE TagNumber = prm_TagNumber;

SELECT EmergencyCaseId INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsEmergencyNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 AND vTagExists = 0 THEN

	INSERT INTO AAU.Patient
		(
			OrganisationId,
			EmergencyCaseId,
			Position,
			AnimalTypeId,
			TagNumber,
            PatientCallOutcomeId,
            SameAsEmergencyCaseId,
            TreatmentPriority,
			PatientStatusId,
            PatientStatusDate
		)
		VALUES
		(
			vOrganisationId,
			prm_EmergencyCaseId,
			prm_Position,
			prm_AnimalTypeId,
			UPPER(prm_TagNumber),
            prm_PatientCallOutcomeId,
            vSameAsEmergencyCaseId,
            prm_TreatmentPriority,
			prm_PatientStatusId,
            prm_PatientStatusDate 
		);

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID(),prm_TagNumber INTO vPatientId,vTagNumber;

    IF IFNULL(prm_TagNumber,'') <> '' THEN
		UPDATE AAU.Census SET PatientId = vPatientId WHERE TagNumber = vTagNumber;
    END IF;



	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vPatientId,'Patient','Insert', NOW());

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO vSuccess;

ELSEIF vTagExists > 0 THEN

	SELECT 3 INTO vSuccess;

ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vSuccess AS success , vTagNumber;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientCallerInteraction !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientCall !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertPatientCallerInteraction(
IN prm_Username VARCHAR(128),
IN prm_PatientId INT,
IN prm_PositiveInteraction TINYINT,
IN prm_CallTime DATETIME,
IN prm_DoneBy INT,
IN prm_CallType INT,
IN prm_PatientCallerInteractionOutcome INT,
IN prm_Comments VARCHAR(1000))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to insert a new PatientCall.
*/
DECLARE vOrganisationId INT;
DECLARE vPatientCallExists INT;
DECLARE vPatientCallerInteractionId INT;
DECLARE vCreatedUserId INT;
DECLARE vSuccess INT;

SET vSuccess = 0;
SET vPatientCallExists = 0;
SET vCreatedUserId = 0;
SET vPatientCallerInteractionId = 0;

SELECT COUNT(1) INTO vPatientCallExists FROM AAU.PatientCallerInteraction WHERE PatientCallerInteractionId = vPatientCallerInteractionId;

SELECT OrganisationId, UserId INTO vOrganisationId, vCreatedUserId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientCallExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientCallerInteraction
		(
        OrganisationId,
		PatientId,
		PositiveInteraction,
		CallDateTime,
		DoneByUserId,
		CallTypeId,
		PatientCallerInteractionOutcomeId,
		CreatedDateTime,
		CreatedBy,
		Comments
		)
		VALUES
		(
        vOrganisationId,
		prm_PatientId,
		prm_PositiveInteraction,
		prm_CallTime,
		prm_DoneBy,
		prm_CallType,
		prm_PatientCallerInteractionOutcome,
		CURRENT_TIMESTAMP(),
		vCreatedUserId,
		prm_Comments
		);

COMMIT;

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vPatientCallerInteractionId;

	INSERT INTO AAU.Logging (OrganisationId,
    UserName,
    RecordId,
    ChangeTable,
    LoggedAction,
    DateTime)
	VALUES (vOrganisationId,
    prm_Username,
    vPatientCallerInteractionId,
    'PatientCall',
    'Insert',
    NOW());

ELSEIF vPatientCallExists > 0 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;


SELECT vPatientCallerInteractionId AS patientCallerInteractionId, vSuccess AS success;

END$$
DELIMITER ;
DELIMITER !!
DROP procedure IF EXISTS AAU.sp_InsertPatientMediaComments!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientMediaComments(
	IN prm_PatientMediaItemId INT,
    IN prm_Username TEXT,
    IN prm_Comment TEXT
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vUserId INT;
DECLARE vCommentExists INT DEFAULT 0;
DECLARE vSuccess INT;
DECLARE vCommentId INT;

SELECT UserId, OrganisationId INTO vUserId, vOrganisationId FROM AAU.User WHERE UserName = prm_Username;
SELECT COUNT(*) INTO vCommentExists FROM AAU.PatientMediaComments
WHERE
UserId = vUserId AND
Comment = prm_Comment AND
PatientMediaItemId = prm_PatientMediaItemId;
IF vCommentExists = 0 THEN
INSERT INTO AAU.PatientMediaComments(
	UserId,
    Comment,
    PatientMediaItemId
) VALUES
(
	vUserId,
    prm_Comment,
    prm_PatientMediaItemId
);

SELECT 1 INTO vSuccess;
SELECT LAST_INSERT_ID() INTO vCommentId;
INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vCommentId,'Media Comment','Insert', NOW());

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;
SELECT vSuccess as success;
END$$
DELIMITER ;
DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientMedia!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientMedia(
IN prm_Username VARCHAR(64),
IN prm_MediaType VARCHAR(45),
IN prm_URL VARCHAR(1000),
IN prm_IsPrimary BOOLEAN,
IN prm_DateTime VARCHAR(45),
IN prm_PatientId INT,
IN prm_HeightPX INT,
IN prm_WidthPX INT,
IN prm_Tags VARCHAR(1000),
OUT prm_MediaItemItemId INT,
OUT prm_Success INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/07/2020
Purpose: Used to insert a new media item for a patient.


Modified By: Ankit
Created On:02/05/2021
Purpose: Removed comment column

*/
DECLARE vOrganisationId INT;

DECLARE vMediaItemExists INT DEFAULT 0;

SELECT COUNT(1) INTO vMediaItemExists FROM AAU.PatientMediaItem WHERE URL = prm_URL;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vMediaItemExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientMediaItem
		(
        OrganisationId,
        PatientId,
        DateTime,
        URL,
        IsPrimary,
        HeightPX,
        WidthPX,
        Tags,
        MediaType
		)
		VALUES
		(
        vOrganisationId,
        prm_PatientId,
        STR_TO_DATE(LEFT(prm_DateTime,19), '%Y-%m-%dT%H:%i:%s'),
        prm_URL,
        prm_IsPrimary,
        prm_HeightPX,
		prm_WidthPX,
		prm_Tags,
		prm_MediaType
		);

COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_MediaItemItemId;

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_MediaItemItemId,'Media Item','Insert', NOW());

ELSEIF vMediaItemExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;


END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTreatmentListRecord !!

DELIMITER $$
-- START TRANSACTION;
-- CALL AAU.sp_InsertTreatmentListRecord(98820, 1, 10, '2021-04-27', NULL, NULL);
-- ROLLBACK TRANSACTION

CREATE PROCEDURE AAU.sp_InsertTreatmentListRecord (	IN prm_PatientId INT,
													IN prm_Admission TINYINT,
													IN prm_InTreatmentAreaId INT,
													IN prm_InDate DATETIME,
													IN prm_InAccepted TINYINT,
                                                    IN prm_PreviousArea INT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

DECLARE vUnaccepted INT;
DECLARE vTotalRecords INT;
DECLARE vPreviousTreatmentId INT;
SET vPreviousTreatmentId = 0;
SET vUnaccepted = 0;
SET vTotalRecords = 0;

SELECT COUNT(1), IFNULL(SUM(IF(InAccepted IS NULL, 1, 0)),0) INTO vTotalRecords, vUnaccepted FROM AAU.TreatmentList WHERE PatientId = prm_PatientId;

IF prm_InTreatmentAreaId IS NOT NULL AND NOT (prm_Admission = 1 AND vTotalRecords > 0) AND vUnaccepted = 0 THEN
	INSERT INTO AAU.TreatmentList	(PatientId, Admission, InTreatmentAreaId, InDate)
									VALUES
									(prm_PatientId, prm_Admission, prm_InTreatmentAreaId, prm_InDate);

	SELECT LAST_INSERT_ID() AS `TreatmentListId`, 1 AS `success`;

-- ELSEIF vAdmissionExists = 0 AND prm_InTreatmentAreaId IS NOT NULL THEN

-- 	UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_InTreatmentAreaId WHERE PatientId = prm_PatientId AND Admission = 1;
--     SELECT 1 AS `success`;

-- We can't insert an admission for a patient that already has one.
ELSEIF prm_InTreatmentAreaId IS NOT NULL AND prm_Admission = 1 AND vTotalRecords > 0 THEN

	UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_InTreatmentAreaId WHERE PatientId = prm_PatientId AND Admission = 1;

 	SELECT -1 AS `TreatmentListId`, 0 AS `success`;

ELSEIF prm_InTreatmentAreaId IS NULL THEN

	DELETE FROM AAU.TreatmentList WHERE PatientId = prm_PatientId AND OutAccepted IS NULL AND InAccepted IS NULL;
    UPDATE AAU.TreatmentList SET OutTreatmentAreaId = NULL, OutDate = NULL WHERE PatientId = prm_PatientId AND OutAccepted IS NULL;
    SELECT -1 AS `TreatmentListId`, 2 AS `success`;

ELSEIF vUnaccepted > 0 THEN

		SELECT -1 AS `TreatmentListId`, 0 AS `success`;

ELSE

	SELECT -1 AS `TreatmentListId`, -1 AS `success`;

END IF;

END $$







DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_SearchEmergencyCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_SearchEmergencyCase( IN prm_Username VARCHAR(45), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 08/03/2020
Purpose: Used to return search for cases and bring back the required details
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT	ec.EmergencyCaseId,
		ec.EmergencyNumber,
		ec.CallDateTime,
		ec.CallerId,
        c.Name,
        c.Number,
        at.AnimalTypeId,
        at.AnimalType,
        p.TagNumber,
		p.PatientCallOutcomeId,
		ec.Location,
		ec.Latitude,
		ec.Longitude
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
WHERE ec.OrganisationId = vOrganisationId
LIMIT 20;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCase !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyCase(
									IN prm_EmergencyCaseId INT,
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DOUBLE(11,8),
									IN prm_Longitude DECIMAL(11,8),
									IN prm_Rescuer1Id INT,
									IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_IsDeleted BOOLEAN,
                                    IN prm_DeletedDate DATETIME,
									IN prm_UserName VARCHAR(64),
									OUT prm_OutEmergencyCaseId INT,
                                    OUT prm_SocketEndPoint CHAR(3),
									OUT prm_Success VARCHAR(64))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a case.
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSameAsEmergencyCaseId INT;

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_EmergencyCaseId INTO prm_OutEmergencyCaseId;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01') INTO vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, prm_SocketEndPoint
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						EmergencyNumber        = prm_EmergencyNumber,
						CallDateTime           = prm_CallDateTime,
						DispatcherId           = prm_DispatcherId,
						EmergencyCodeId        = prm_EmergencyCodeId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						Rescuer1Id             = prm_Rescuer1Id,
						Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted,
                        DeletedDate			   = prm_DeletedDate,
                        UpdateTime			   = prm_UpdateTime,
                        Comments			   = prm_Comments
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO prm_Success;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update', NOW());


ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO prm_Success; -- Already updated

ELSEIF prm_UpdateTime > vUpdateTime THEN
	SELECT 4 INTO prm_Success; -- Emergency record already updated another time.

ELSE
	SELECT 5 INTO prm_Success; -- Other error
END IF;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, NULL);

END$$
DELIMITER ;

DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient!!
DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_Position INT,
									IN prm_AnimalTypeId INT,
                                    IN prm_IsDeleted INT,
                                    IN prm_TagNumber VARCHAR(45),
                                    IN prm_PatientCallOutcomeId INT,
                                    IN prm_SameAsEmergencyNumber INT,
									IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagNumber VARCHAR(45);
DECLARE vExistingTagNumber VARCHAR(45);
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vSuccess INT;

SET vTagNumber = NULL;
SET vSameAsEmergencyCaseId = NULL;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND Position = prm_Position AND IsDeleted = 0;

SELECT TagNumber INTO vExistingTagNumber FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT EmergencyCaseId INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsEmergencyNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

	UPDATE AAU.Patient SET
			Position		= prm_Position,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= IF(prm_IsDeleted = 1, NULL, UPPER(prm_TagNumber)),
            PatientCallOutcomeId = prm_PatientCallOutcomeId,
            SameAsEmergencyCaseId = vSameAsEmergencyCaseId,
            IsDeleted		= prm_IsDeleted,
            PatientStatusDate = prm_PatientStatusDate,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END
	WHERE PatientId = prm_PatientId;

    -- Now update the Census in case there were records entered there early.
    IF IFNULL(prm_TagNumber, '') <> '' AND vExistingTagNumber <> prm_TagNumber THEN
		UPDATE AAU.Census SET TagNumber = prm_TagNumber WHERE PatientId = prm_PatientId;
    END IF;

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update', NOW());

    SELECT 1,prm_TagNumber,prm_PatientId INTO vSuccess,vTagNumber,vPatientId;

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vTagNumber, vSuccess AS success;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientCallerInteraction !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientCall !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientCallerInteraction(
														IN prm_Username VARCHAR(128),
														IN prm_PatientCallerInteractionId INT,
														IN prm_PatientId INT,
														IN prm_PositiveInteraction TINYINT,
														IN prm_CallTime DATETIME,
														IN prm_DoneBy INT,
														IN prm_CallType INT,
														IN prm_PatientCallerInteractionOutcome INT,
														IN prm_Comments VARCHAR(1000)
														)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientCall record.
*/

DECLARE vPatientCallExists INT;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

SET vPatientCallExists = 0;
SET vOrganisationId = 0;
SET vSuccess = 0;

SELECT COUNT(1), MAX(OrganisationId) INTO vPatientCallExists, vOrganisationId FROM AAU.PatientCallerInteraction WHERE PatientCallerInteractionId = prm_PatientCallerInteractionId;

IF vPatientCallExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.PatientCallerInteraction
		SET
			PatientId             = prm_PatientId,
			PositiveInteraction   = prm_PositiveInteraction,
			CallDateTime          = prm_CallTime,
			DoneByUserId      = prm_DoneBy,
			CallTypeId            = prm_CallType,
			PatientCallerInteractionOutcomeId  = prm_PatientCallerInteractionOutcome,
			Comments              = prm_Comments
		WHERE PatientCallerInteractionId = prm_PatientCallerInteractionId;

COMMIT;

	SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientCallerInteractionId, 'PatientCall', 'Update', NOW());

ELSEIF vPatientCallExists = 0 THEN

	SELECT 2 INTO vSuccess;

ELSEIF vPatientCallExists > 1 THEN

	SELECT 3 INTO vSuccess;

ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vSuccess AS success;

END$$

DELIMITER !!
DROP PROCEDURE AAU.sp_UpdatePatientMedia!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientMedia(
IN prm_Username VARCHAR(45),
IN prm_PatientMediaItemId INT,
IN prm_MediaType VARCHAR(45),
IN prm_isPrimary BOOLEAN,
IN prm_DateTime VARCHAR(45),
IN prm_HeightPX INT,
IN prm_WidthPX INT,
IN prm_Tags VARCHAR(1000),
IN prm_Deleted BOOLEAN,
OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientMediaItem record.


Modified By: Ankit Singh
Modified On: 04/05/2021
Purpose: removed comment column
*/

DECLARE vPatientMediaItemExists INT;
DECLARE vOrganisationId INT;

SET vPatientMediaItemExists = 0;
SET vOrganisationId = 0;

SELECT COUNT(1), MAX(OrganisationId) INTO vPatientMediaItemExists, vOrganisationId FROM AAU.PatientMediaItem WHERE PatientMediaItemId = prm_PatientMediaItemId;

IF vPatientMediaItemExists = 1 THEN

START TRANSACTION;
	  UPDATE AAU.PatientMediaItem
			SET
			DateTime  = DATE_FORMAT(prm_DateTime,'%Y-%m-%dT%H:%i:%s'),
			IsPrimary = prm_IsPrimary,
			HeightPX  = prm_HeightPX,
			WidthPX   = prm_WidthPX,
			Tags      = prm_Tags,
			MediaType = prm_MediaType,
			IsDeleted = prm_Deleted,
			DeletedDateTime = IF(prm_Deleted = 1, CURRENT_TIMESTAMP(), NULL)
			WHERE PatientMediaItemId = prm_PatientMediaItemId;
COMMIT;

	SELECT 1 INTO prm_Success;

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientMediaItemId, 'PatientMediaItem', 'Update', NOW());

ELSEIF vPatientMediaItemExists = 0 THEN

	SELECT 2 INTO prm_Success;

ELSEIF vPatientMediaItemExists > 1 THEN

	SELECT 3 INTO prm_Success;

ELSE

	SELECT 4 INTO prm_Success;
END IF;
-- STR_TO_DATE(LEFT(prm_DateTime,19), '%Y-%m-%dT%H:%i:%s'),

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
WHERE rd.ReleaseDetailsId = prm_ReleaseDetailsId;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn (
													IN prm_TreatmentListId INT,
                                                    IN prm_PatientId INT,
                                                    IN prm_Accepted TINYINT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating accepting a moved in record from another area. This procedure also updates the moved out flag on the previous record.
*/

DECLARE vSuccess INT;
SET vSuccess = 0;

IF prm_Accepted = TRUE THEN

UPDATE AAU.TreatmentList
	SET InAccepted = prm_Accepted,
    OutTreatmentAreaId = IF(OutAccepted = 0, NULL, OutAccepted),
    OutDate = IF(OutAccepted = 0, NULL, OutDate),
    OutAccepted = IF(OutAccepted = 0, NULL, OutAccepted)
WHERE TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

ELSE

DELETE FROM AAU.TreatmentList WHERE TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

END IF;

UPDATE AAU.TreatmentList
	SET OutAccepted = prm_Accepted
WHERE	PatientId = prm_PatientId AND
		OutAccepted IS NULL AND
		OutTreatmentAreaId IS NOT NULL;

SELECT vSuccess AS success;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_MoveOut !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_MoveOut (
													IN prm_PatientId INT,
													IN prm_TreatmentListId INT,
													IN prm_OutTreatmentAreaId INT,
													IN prm_OutDate DATETIME
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating the treatment list to move a patient out of an area. A moved in record can only be added with sp_InsertTreatmentListRecord .
*/

UPDATE AAU.TreatmentList SET
			InTreatmentAreaId = IF(Admission = 1 AND InAccepted != 1, prm_OutTreatmentAreaId, InTreatmentAreaId),
			OutTreatmentAreaId = IF(InAccepted = 1, prm_OutTreatmentAreaId, NULL),
			OutDate = IF(InAccepted = 1, prm_OutDate, NULL),
            OutAccepted = NULL
            -- OutTreatmentAreaId = prm_OutTreatmentAreaId,
            -- OutDate = prm_OutDate
WHERE TreatmentListId = prm_TreatmentListId;

-- We also need to update any outstanding unaccepted moved in records
UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_OutTreatmentAreaId WHERE PatientId = prm_PatientId AND InAccepted IS NULL;

SELECT IF(ROW_COUNT() > 0, 1, 0) AS `success`;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_Resolve !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_Resolve ( IN prm_PatientId INT, IN prm_OutOfHospital TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating the treatment list to set the OutOfHospital flag when the patient is released from the hospital.
*/

UPDATE AAU.TreatmentList SET OutOfHospital = prm_OutOfHospital WHERE PatientId = prm_PatientId AND OutTreatmentAreaId IS NULL;

SELECT IF(ROW_COUNT() > 0, 1, 0) AS `success`;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateUserById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateUserById(IN prm_UserId INT,
										IN prm_FirstName NVARCHAR(64),
										IN prm_Surname NVARCHAR(64),
                                        IN prm_Initials NVARCHAR(64),
                                        IN prm_Colour NVARCHAR(64),
										IN prm_Telephone NVARCHAR(64),
                                        IN prm_UserName NVARCHAR(64),
                                        IN prm_Password NVARCHAR(255),
										IN prm_TeamId INTEGER,
										IN prm_RoleId INTEGER,
                                        IN prm_PermissionArray JSON
										)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to update a user by id.
*/

DECLARE vUserCount INT;
DECLARE vPassword NVARCHAR(255);
DECLARE vUsernameCount INT;
DECLARE vComboKeyCount INT;
DECLARE vUpdateSuccess INT;
SET vUserCount = 0;
SET vUsernameCount = 0;
SET vComboKeyCount = 0;
SET vUpdateSuccess = 0;

-- Check that the user exists
SELECT COUNT(1), Password INTO vUserCount, vPassword FROM AAU.User WHERE UserId = prm_UserId;

-- Check that the incoming username doesn't exist
SELECT COUNT(1) INTO vUsernameCount FROM AAU.User WHERE UserId <> prm_UserId AND UserName = prm_UserName;

-- Check that the incoming first name, surname and telephone don't already exist
SELECT COUNT(1) INTO vComboKeyCount FROM AAU.User WHERE UserId <> prm_UserId	AND	FirstName	= prm_FirstName
																				AND	Surname		= prm_Surname
																				AND	Telephone	= prm_Telephone;


IF vUserCount = 1 AND vUsernameCount = 0 AND vComboKeyCount = 0 THEN

	UPDATE AAU.User
		SET	FirstName	= prm_FirstName,
			Surname		= prm_Surname,
            Initials    = prm_Initials,
            Colour      = prm_Colour,
			Telephone	= prm_Telephone,
            UserName	= prm_UserName,
            Password	= IFNULL(prm_Password , vPassword),
			TeamId		= prm_TeamId,
			RoleId		= prm_RoleId,
            PermissionArray = prm_PermissionArray
	WHERE UserId = prm_UserId;


SELECT 1 INTO vUpdateSuccess; -- User update OK.

ELSEIF vUserCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- User Doesn't exist

ELSEIF vUserCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

ELSEIF vUsernameCount >= 1 THEN

SELECT 4 INTO vUpdateSuccess; -- The username already exists

ELSEIF vComboKeyCount >= 1 THEN

SELECT 5 INTO vUpdateSuccess; -- The first name + surname + telephone number already exists

ELSE

SELECT 6 INTO vUpdateSuccess; -- Return misc

END IF;

SELECT vUpdateSuccess;



END$$
DELIMITER ;

DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdateVisitDate!!
DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdateVisitDateByReleaseDetailsId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateVisitDate(
	IN prm_ReleaseDetailsId INT
)
BEGIN
/*
Created By: Ankit Singh
Created On: 15/04/2021
Purpose: Renamed procedure to differenciate between similar update visit.
*/
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
END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertAndUpdateStreetTreatCase!!

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertStreetTreatCase!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertStreetTreatCase(
		IN prm_Username VARCHAR(45),
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


Created By: Ankit Singh
Created On: 27/04/2021
Purpose: ON DUPLICATE KEY UPDATE Added
*/

DECLARE vStreetTreatCaseId INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

INSERT INTO AAU.StreetTreatCase(
                        PatientId,
						PriorityId,
						StatusId,
						TeamId,
                        MainProblemId,
						AdminComments,
						OperatorNotes,
                        ClosedDate,
                        EarlyReleaseFlag,
                        OrganisationId
					) VALUES (
                        prm_PatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag,
                        vOrganisationId
						) ON DUPLICATE KEY UPDATE
                        PriorityId			= prm_PriorityId,
						StatusId			= prm_StatusId,
						TeamId				= prm_TeamId,
						MainProblemId		= prm_MainProblemId,
						AdminComments		= prm_AdminComments,
						OperatorNotes		= prm_OperatorNotes,
						ClosedDate			= prm_ClosedDate,
						EarlyReleaseFlag	= prm_EarlyReleaseFlag;

	SELECT 1 INTO vSuccess;

	SELECT StreetTreatCaseId INTO vStreetTreatCaseId FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;

    UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreetTreatCaseId,'Case','Upsert', NOW());
	SELECT vStreetTreatCaseId AS streetTreatCaseId, vSuccess AS success;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_AddOrUpdateStreetTreatPatient !!
DROP PROCEDURE IF EXISTS AAU.sp_UpsertStreetTreatPatient !!


DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertStreetTreatPatient(IN prm_Username VARCHAR(20),
													 IN prm_EmergencyCaseId INT,
                                                     IN prm_AddToStreetTreat INT,
                                                     IN prm_PatientId INT
													)
BEGIN
/*
Modified By: Ankit Singh
Modified On: 15/04/2021
Purpose: Check for case already in patients table and streettreatcase table by patienid.
*/
DECLARE vTeamId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vPatientExists INT;
DECLARE vCaseId INT;
DECLARE stTagNumber VARCHAR(20);
DECLARE vTagNumber VARCHAR(20);
DECLARE vOrganisationId INT;
SET vStreetTreatCaseExists = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF prm_AddToStreetTreat = 1 THEN
    
    
		SELECT TeamId INTO vTeamId FROM AAU.Team WHERE TeamName = 'Team Vinod';
		
		SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO stTagNumber
		FROM AAU.Patient
		WHERE TagNumber LIKE 'ST%';
		
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Patient WHERE TagNumber = stTagNumber;        
		SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient p LEFT JOIN AAU.StreetTreatCase st ON st.PatientId = p.PatientId WHERE st.PatientId = prm_PatientId;
        
		IF vStreetTreatCaseExists = 0 AND vPatientExists < 1 THEN
        
        INSERT INTO AAU.StreetTreatCase (PatientId,PriorityId,StatusId,TeamId,MainProblemId,AdminComments,OrganisationId)
			VALUES(prm_PatientId, 4, 1, vTeamId, 6, 'Added by Apoms',vOrganisationId);
            
			SELECT LAST_INSERT_ID(),stTagNumber INTO vCaseId,vTagNumber;
            
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = vTagNumber, PatientStatusId = 8, PatientStatusDate = CURDATE() WHERE PatientId = prm_PatientId;
			
		END IF;

ELSEIF prm_AddToStreetTreat = 0 THEN

	SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;  
 
	IF vStreetTreatCaseExists = 1 THEN
		UPDATE AAU.Patient SET TagNumber = NULL, UpdateTime = NOW(), PatientStatusId = 1 WHERE PatientId = prm_PatientId;
		
		DELETE FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId 
		AND StreetTreatCaseId NOT IN (
			SELECT StreetTreatCaseId FROM AAU.Visit
		);
	
	END IF;
    
	SELECT NULL,0 INTO vTagNumber,vCaseId;

END IF;

SELECT vTagNumber, vCaseId;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertVisit!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertVisit(
	IN prm_StreetTreatCaseId INT,
    IN prm_VisitId INT,
	IN prm_VisitDate DATE,
	IN prm_VisitTypeId INT,
	IN prm_StatusId INT,
	IN prm_AdminNotes TEXT,
	IN prm_OperatorNotes TEXT,
	IN prm_IsDeleted INT,
	IN prm_Day TINYINT
)
BEGIN

DECLARE vVisitExisits INT;
DECLARE vVisitDateExists INT;
DECLARE vSuccess TINYINT;
DECLARE vVisitIdExisits boolean;

SET vVisitExisits = 0;
SET vVisitDateExists = 0;
SET vSuccess = -1;

SELECT COUNT(1) INTO vVisitExisits FROM AAU.Visit WHERE
VisitId = prm_VisitId
AND StreetTreatCaseId = prm_StreetTreatCaseId
AND (IsDeleted = 0 OR IsDeleted IS NULL);

SELECT COUNT(1) INTO vVisitDateExists FROM AAU.Visit WHERE
StreetTreatCaseId = prm_StreetTreatCaseId AND
VisitId = prm_VisitId AND
Date = prm_VisitDate AND
isDeleted = 0;

IF prm_VisitId IS NULL THEN

	INSERT INTO AAU.Visit(
			StreetTreatCaseId,
			VisitTypeId,
			Date,
			StatusId,
			AdminNotes,
			OperatorNotes,
			IsDeleted,
			Day
		) VALUES (
			prm_StreetTreatCaseId,
			prm_VisitTypeId,
			prm_VisitDate,
			prm_StatusId,
			prm_AdminNotes,
			prm_OperatorNotes,
			prm_IsDeleted,
			prm_Day
		);

    SELECT LAST_INSERT_ID() INTO prm_VisitId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_VisitId,'Visit','Insert', NOW());


ELSEIF vVisitExisits = 1 AND vVisitDateExists = 0 THEN

	UPDATE AAU.Visit
		SET
			VisitTypeId		= prm_VisitTypeId,
            Date			= prm_VisitDate,
            StatusId		= prm_StatusId,
            AdminNotes		= prm_AdminNotes,
            OperatorNotes	= prm_OperatorNotes,
            IsDeleted		= prm_IsDeleted,
            Day				= prm_Day
		WHERE
			VisitId = prm_VisitId;

    INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_VisitId,'Visit','Update', NOW());

    SELECT 2 INTO vSuccess;

ELSEIF vVisitDateExists > 0 THEN
    SELECT 3 INTO vSuccess;
ELSE
	SELECT 4 INTO vSuccess;

END IF;

SELECT vSuccess AS success, prm_VisitId AS visitId, DATE_FORMAT(prm_VisitDate, '%Y-%m-%d') AS visitDate;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateRescueDetails !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateRescueDetails(
									IN prm_UserName VARCHAR(64),
									IN prm_EmergencyCaseId INT,
                                    IN prm_Rescuer1Id INT,
                                    IN prm_Rescuer2Id INT,
                                    IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vUpdateTime DATETIME;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE vSocketEndPoint VARCHAR(3);

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01') INTO vEmNoExists, vUpdateTime
FROM AAU.EmergencyCase 
WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 1 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET						
						Rescuer1Id             = prm_Rescuer1Id,
						Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,						
                        UpdateTime			   = prm_UpdateTime
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO vSuccess;
    
	CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, null);

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase RescueDetails',CONCAT('Update ', prm_UpdateTime, ' ', vUpdateTime), NOW());    
       

ELSEIF vEmNoExists > 1 THEN

	SELECT 2 INTO vSuccess;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO vSuccess; -- Already updated

ELSEIF vUpdateTime > prm_UpdateTime THEN
	SELECT 4 INTO vSuccess; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO vSuccess; -- Other error   
END IF;

SELECT vSocketEndPoint AS socketEndPoint, vSuccess AS success; 

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithNoVisits!!

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
        ec.EmergencyCaseId,
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
    AND stc.StatusId < 4
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
          'Priority', rawData.Priority,
          'PatientId',rawData.PatientId,
          'EmergencyCaseId',rawData.EmergencyCaseId
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

DROP PROCEDURE IF EXISTS AAU.sp_UpsertStreetTreatCase !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpsertStreetTreatCase(
		IN prm_Username VARCHAR(45),
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


Created By: Ankit Singh
Created On: 27/04/2021
Purpose: ON DUPLICATE KEY UPDATE Added
*/

DECLARE vStreetTreatCaseId INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

INSERT INTO AAU.StreetTreatCase(
						OrganisationId,
                        PatientId,
						PriorityId,
						StatusId,
						TeamId,
                        MainProblemId,
						AdminComments,
						OperatorNotes,
                        ClosedDate,
                        EarlyReleaseFlag,
                        OrganisationId
					) VALUES (
						vOrganisationId,
                        prm_PatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag,
                        vOrganisationId
						) ON DUPLICATE KEY UPDATE
                        PriorityId			= prm_PriorityId,
						StatusId			= prm_StatusId,
						TeamId				= prm_TeamId,
						MainProblemId		= prm_MainProblemId,
						AdminComments		= prm_AdminComments,
						OperatorNotes		= prm_OperatorNotes,
						ClosedDate			= prm_ClosedDate,
						EarlyReleaseFlag	= prm_EarlyReleaseFlag;

	SELECT 1 INTO vSuccess;

	SELECT StreetTreatCaseId INTO vStreetTreatCaseId FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;

    UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreetTreatCaseId,'Case','Upsert', NOW());
	SELECT vStreetTreatCaseId AS streetTreatCaseId, vSuccess AS success;
END$$


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetScoreCard!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetScoreCard(IN prm_Username VARCHAR(45))
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
DECLARE vOrganisationId INT;

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
SET vOrganisationId = 0;

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

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

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

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutcomes!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutcomes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallOutcomeId, CallOutcome, SortOrder FROM AAU.CallOutcome WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
