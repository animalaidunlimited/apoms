DELIMITER !!

DROP FUNCTION IF EXISTS AAU.fn_GetRescueReleaseStStatusForDriverView !!

DELIMITER $$

CREATE FUNCTION AAU.fn_GetRescueReleaseStStatusForDriverView(
	ReleaseDetailsId INT,
	RequestedUser VARCHAR(45),
	RequestedDate Date,
	PickupDate DATE,
	BeginDate DATE,
	EndDate DATE,
	AmbulanceArrivalTime DATETIME,
	RescueTime DATETIME,
	AdmissionTime DATETIME,
	PatientCallOutcomeId INT,
	InTreatmentAreaId INT,
	StreetTreatCaseId INT,
	VisitBeginDate DATETIME,
	VisitEndDate DATETIME	
) RETURNS varchar(25) CHARSET utf8mb4
    DETERMINISTIC

BEGIN

DECLARE AssignmentStatus VARCHAR(25);

	IF (
		AmbulanceArrivalTime IS NULL AND
		RescueTime IS NULL AND
		ReleaseDetailsId IS NULL AND
		StreetTreatCaseId IS NULL
    ) OR
    (
		AmbulanceArrivalTime IS NOT NULL AND
		RescueTime IS NOT NULL AND
        AdmissionTime IS NOT NULL AND
        PatientCallOutcomeId = 1 AND
        InTreatmentAreaId IS NOT NULL AND
        ReleaseDetailsId IS NOT NULL AND
        BeginDate IS NULL AND
        PickupDate IS NULL AND
        EndDate IS NULL AND
        StreetTreatCaseId IS NULL
    ) OR
    (
		StreetTreatCaseId IS NOT NULL AND
        VisitBeginDate IS NULL AND
		VisitEndDate IS NULL 
    )
    
    THEN SET AssignmentStatus = 'Assigned';    
    
ELSEIF
	(
		AmbulanceArrivalTime IS NOT NULL AND
		RescueTime IS NULL AND
		ReleaseDetailsId IS NULL AND
		StreetTreatCaseId IS NULL
    ) OR
    (
		AmbulanceArrivalTime IS NOT NULL AND
		RescueTime IS NOT NULL AND
        AdmissionTime IS NOT NULL AND
        PatientCallOutcomeId = 1 AND
        InTreatmentAreaId IS NOT NULL AND
        ReleaseDetailsId IS NOT NULL AND
        PickupDate IS NOT NULL AND
        BeginDate IS NOT NULL AND
        EndDate IS NULL AND
        StreetTreatCaseId IS NULL
    ) OR
    (
		StreetTreatCaseId IS NOT NULL AND
        VisitBeginDate IS NOT NULL AND
		VisitEndDate IS NULL 
    )
    
    THEN SET AssignmentStatus = 'In Progress';
    
ELSEIF
	(
		AmbulanceArrivalTime IS NOT NULL AND
		RescueTime IS NOT NULL AND
        AdmissionTime IS NOT NULL AND
		PatientCallOutcomeId = 1 AND
        InTreatmentAreaId IS NOT NULL AND
		ReleaseDetailsId IS NULL AND
		StreetTreatCaseId IS NULL
    ) OR
    (
		AmbulanceArrivalTime IS NOT NULL AND
		RescueTime IS NOT NULL AND
        AdmissionTime IS NOT NULL AND
        PatientCallOutcomeId = 1 AND
        InTreatmentAreaId IS NOT NULL AND
        ReleaseDetailsId IS NOT NULL AND
        PickupDate IS NOT NULL AND
        BeginDate IS NOT NULL AND
        EndDate IS NOT NULL AND
        StreetTreatCaseId IS NULL
    ) OR
    (
		StreetTreatCaseId IS NOT NULL AND
        VisitBeginDate IS NOT NULL AND
		VisitEndDate IS NOT NULL 
    )
    
    THEN SET AssignmentStatus = 'Complete';
    
ELSEIF
	(
		AmbulanceArrivalTime IS NOT NULL AND
		RescueTime IS NOT NULL AND
        AdmissionTime IS NULL AND
		PatientCallOutcomeId IS NULL AND
        InTreatmentAreaId IS NULL AND
		ReleaseDetailsId IS NULL AND
		StreetTreatCaseId IS NULL
    ) OR
    (
		AmbulanceArrivalTime IS NOT NULL AND
		RescueTime IS NOT NULL AND
        AdmissionTime IS NOT NULL AND
        PatientCallOutcomeId = 1 AND
        InTreatmentAreaId IS NOT NULL AND
        ReleaseDetailsId IS NOT NULL AND
        PickupDate IS NOT NULL AND
        BeginDate IS NULL AND
        EndDate IS NULL AND
        StreetTreatCaseId IS NULL
    )
    THEN SET AssignmentStatus = 'In Ambulance';
	
END IF;

RETURN (AssignmentStatus);
END$$

DELIMITER ;
DELIMITER !!

DROP FUNCTION IF EXISTS AAU.fn_GetRescueStatus!!

DELIMITER $$
CREATE FUNCTION AAU.fn_GetRescueStatus(
	ReleaseDetailsId INT,
	RequestedUser VARCHAR(45),
    RequestedDate Date,
    AssignedReleaseVehicleId INT,
    PickupDate DATE,
    BeginDate DATE,
    EndDate DATE,
	AssignedRescueVehicleId INT,
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
			(
            AssignedRescueVehicleId IS NULL AND
            CallOutcomeId IS NULL AND
            ReleaseDetailsId IS NULL AND
            RequestedUser IS NULL AND
            RequestedDate IS NULL
            ) 
            OR
            (
            AssignedRescueVehicleId IS NOT NULL AND
            CallOutcomeId IS NOT NULL AND
			ReleaseDetailsId IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            AssignedReleaseVehicleId IS NULL
            )
			THEN SET rescueReleaseStatus = 1;
            
        ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
			AmbulanceArrivalTime IS NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL
            ) 
            OR
            (
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NULL
            -- EndDate IS NULL
            )
			THEN SET rescueReleaseStatus = 2;
            
		ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
            AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL
            )
            OR
            (
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NOT NULL AND
            BeginDate IS NULL
            )
			THEN SET rescueReleaseStatus = 3;
		ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
			AdmissionTime IS NULL AND
			ReleaseDetailsId IS NULL
            )
            OR
            (
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NOT NULL AND 
            BeginDate IS NOT NULL AND
            EndDate IS NULL
            )
			THEN SET rescueReleaseStatus = 4;
            
		ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NULL  AND
				(
				CallOutcomeId IS NULL OR
				InTreatmentAreaId IS NULL
				)
            ) 
            OR
            (
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NOT NULL AND 
            BeginDate IS NOT NULL AND 
            EndDate IS NULL
            )
			THEN SET rescueReleaseStatus = 5;        
        
        END IF;
        
	-- return the rescue status
	RETURN (rescueReleaseStatus);
END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveVehicleLocations!!

DELIMITER $$

-- CALL AAU.sp_GetActiveVehicleLocations('Jim');

CREATE PROCEDURE AAU.sp_GetActiveVehicleLocations(IN prm_UserName VARCHAR(45))
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;


WITH vehicleListCTE AS 
(
SELECT 
JSON_OBJECT(
"vehicleId", v.VehicleId,
"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
"vehicleNumber", v.VehicleNumber,
"smallAnimalCapacity", v.SmallAnimalCapacity,
"largeAnimalCapacity", v.LargeAnimalCapacity,
"vehicleImage", v.VehicleImage,
"vehicleTypeId", v.VehicleTypeId) AS `vehicleDetails`,

JSON_OBJECT(
"speed", Speed,
"heading", Heading,
"accuracy", Accuracy,
"altitude", Altitude,
"altitudeAccuracy", AltitudeAccuracy,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", vl.Latitude),
JSON_OBJECT("lng", Longitude))) AS `vehicleLocation`,
JSON_ARRAYAGG(
JSON_OBJECT(
"firstName", u.FirstName,
"surname", u.Surname,
"initials", u.Initials,
"colour", u.Colour)) AS `vehicleStaff`
FROM AAU.Vehicle v
LEFT JOIN
(
SELECT	VehicleId, Latitude, Longitude, Speed, Heading, Accuracy, Altitude, AltitudeAccuracy,
		ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY Timestamp DESC) AS `RNum`
FROM AAU.VehicleLocation
WHERE CAST(Timestamp AS DATE) = '2021-07-04'
AND OrganisationId = vOrganisationId
) vl ON vl.VehicleId = v.VehicleId AND vl.RNum = 1
LEFT JOIN AAU.VehicleShift vs ON vs.VehicleId = vl.VehicleId
LEFT JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE v.VehicleStatusId = 1
GROUP BY vl.VehicleId,
vl.Latitude,
vl.Longitude
)

SELECT
JSON_ARRAYAGG(
JSON_OBJECT(
"vehicleDetails", vehicleDetails,
"vehicleLocation", vehicleLocation,
"vehicleStaff", vehicleStaff
)) AS `vehicleList`
FROM vehicleListCTE;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDriverViewDetails !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetDriverViewDetails(IN prm_Date DATETIME)
BEGIN

/*
Created Date: 11/06/2021
CreatedBy: Arpit Trivedi
Purpose: To get the cases for driver view
*/

WITH RescueReleaseST AS
(SELECT p.PatientId FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
WHERE CAST('2021-06-11' AS DATE) >= CAST(ec.AmbulanceAssignmentTime AS DATE) AND (CAST('2021-06-11' AS DATE) <=  COALESCE(CAST(ec.AdmissionTime AS DATE), CAST(ec.RescueTime AS DATE), CURDATE()))
AND (p.PatientCallOutcomeId IS NULL OR p.PatientCallOutcomeId IS NOT NULL)

UNION 

SELECT rd.PatientId FROM AAU.ReleaseDetails rd
WHERE CAST('2021-06-11' AS DATE) >= CAST(rd.AmbulanceAssignmentTime AS DATE) AND CAST('2021-06-11' AS DATE) <= IFNULL(CAST(rd.EndDate AS DATE), CURDATE())

UNION

SELECT st.PatientId FROM AAU.StreetTreatCase st
INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = st.StreetTreatCaseId
WHERE CAST(v.Date AS DATE) = CAST('2021-06-11' AS DATE) AND st.AmbulanceAssignmentTime IS NOT NULL
),
EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescueReleaseST)
),
CallerCTE AS 
(
SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName', c.Name),
	JSON_OBJECT('callerNumber', c.Number),
    JSON_OBJECT('callerAlternativeNumber', c.AlternativeNumber)
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
        p.PatientCallOutcomeId AS `PatientCallOutcomeId`,
        p.PatientId,
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("animalTypeId", p.AnimalTypeId),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("position", p.Position),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InTreatmentAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",p.SameAsEmergencyCaseId)
                )
            ),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems,
            pp.problemsJSON
		)) AS Patients
    FROM AAU.Patient p    
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(                    
				JSON_OBJECT("problemId", pp.ProblemId),                        
				JSON_OBJECT("problem", pr.Problem) 
				)
			 )
		) AS problemsJSON,
		JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM RescueReleaseST)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
    LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
    LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
    LEFT JOIN AAU.StreetTReatCase std ON std.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescueReleaseST)
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescueReleaseST)
    GROUP BY p.EmergencyCaseId,
    IFNULL(rd.PatientId, p.EmergencyCaseId)
)
,
DriverViewCTE AS
(
SELECT 
			IF((rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NULL),'Rescue', 
				IF((rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NULL),'Release',
				IF((rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NOT NULL),'StreetTreat',
				IF((rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL),'STRelease',NULL)
				))) AS AmbulanceAction,
            rd.ReleaseDetailsId,
            rd.AssignedVehicleId AS ReleaseAssignedVehicleId,
            rd.AmbulanceAssignmentTime AS ReleaseAmbulanceAssignmentTime,
            rd.RequestedDate,
            rd.ComplainerNotes,
			ec.Comments,
            rd.Releaser1Id,
            std.StreetTreatCaseId,
            std.MainProblemId,
            ec.AssignedVehicleId,
            ec.AmbulanceAssignmentTime,
            ec.Admissiontime,
            mp.MainProblem,
            std.PriorityId,
            p.Priority,
            tl.InTreatmentAreaId,
            p.PatientCallOutcomeId,
            rd.PickupDate,
            p.PatientId,
            rd.BeginDate,
            rd.EndDate,
			v.VisitId,
            v.VisitBeginDate,
            v.VisitEndDate,
            v.VisitTypeId, 
			v.Date, 
			v.StatusId, 
			v.AdminNotes, 
			v.OperatorNotes, 
            ec.AmbulanceArrivalTime,
            ec.RescueTime,            
			ec.EmergencyCaseId,
            ec.EmergencyNumber,
            ec.EmergencyCodeId,
            ec.DispatcherId,
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
LEFT JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
LEFT JOIN CallerCTE c ON c.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId 
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId
LEFT JOIN AAU.priority p ON p.PriorityId = std.PriorityId
LEFT JOIN AAU.MainProblem mp ON mp.MainProblemId = std.MainProblemId
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = std.StreetTreatCaseId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
JSON_OBJECT("actionStatus", null),
JSON_OBJECT("ambulanceAction", AmbulanceAction),
JSON_OBJECT("releaseDetailsId", ReleaseDetailsId),
JSON_OBJECT("releaseRequestDate", RequestedDate),
JSON_OBJECT("releaseComplainerNotes", ComplainerNotes),
JSON_OBJECT("streetTreatCaseId", StreetTreatCaseId),
JSON_OBJECT("streetTreatMainProblemId", MainProblemId),
JSON_OBJECT("streetTreatMainProblem", MainProblem),
JSON_OBJECT("streetTreatPriorityId", PriorityId),
JSON_OBJECT("streetTreatPriority", Priority),
JSON_OBJECT("patientCallOutcomeId", PatientCallOutcomeId),
JSON_OBJECT("releasePickupDate", DATE_Format(PickupDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("releaseBeginDate", DATE_Format(BeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseEndDate", DATE_Format(EndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitBeginDate", DATE_Format(VisitBeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitEndDate", DATE_Format(VisitEndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("ambulanceArrivalTime", DATE_Format(AmbulanceArrivalTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_Format(RescueTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("emergencyCaseId", EmergencyCaseId),
JSON_OBJECT("dispatcher", DispatcherId),
JSON_OBJECT("visitTypeId", VisitTypeId),
JSON_OBJECT("visitDate", Date),
JSON_OBJECT("visitStatusId", StatusId),
JSON_OBJECT("visitAdminNotes", AdminNotes),
JSON_OBJECT("visitOperatorNotes", OperatorNotes),
JSON_OBJECT("rescueAmbulanceId", AssignedVehicleId),
JSON_OBJECT("rescueAmbulanceAssignmentDate", DATE_Format(AmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseAmbulanceId", ReleaseAssignedVehicleId),
JSON_OBJECT("releaseAmbulanceAssignmentDate", DATE_Format(ReleaseAmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_Format(AdmissionTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("inTreatmentAreaId", InTreatmentAreaId),
JSON_OBJECT("emergencyNumber", EmergencyNumber),
JSON_OBJECT("emergencyCodeId", EmergencyCodeId),
JSON_OBJECT("emergencyCode", EmergencyCode),
JSON_OBJECT("caseComments", Comments),
JSON_OBJECT("visitId", VisitId),
JSON_OBJECT("callDateTime", DATE_Format(CallDateTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("location", Location),
JSON_OBJECT("latLngLiteral", latLngLiteral),
JSON_OBJECT("isUpdated", FALSE),
callerDetails,
Patients))AS DriverViewData
FROM DriverViewCTE;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDriverViewQuestions !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDriverViewQuestions(In prm_Username VARCHAR(45))
BEGIN

/*
CreatedDate:09/07/2021
CreatedBy: Arpit Trivedi
Purpose: To create the driver view form dynamically
*/

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT('actionStatus', ActionStatus),
JSON_OBJECT('subAction', SubAction),
JSON_OBJECT('formControlName', FormControlName),
JSON_OBJECT('type', FormControlType),
JSON_OBJECT('sortOrder', SortOrder),
JSON_OBJECT('functionName', SelectFunctionName),
JSON_OBJECT('label', Label),
JSON_OBJECT('idName', IdName),
JSON_OBJECT('valueName', ValueName)
)) questionList
FROM AAU.DriverViewQuestions;


END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId !!

DELIMITER $$
CREATE  PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId( IN prm_EmergencyCaseId INT, IN prm_PatientId INT)
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
    rd.ReleaseDetailsId
)


SELECT JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", AAU.fn_GetRescueStatus(	rd.ReleaseDetailsId, 
													rd.RequestedUser, 
													rd.RequestedDate, 
													rd.AssignedVehicleId, 
													rd.PickupDate,
													rd.BeginDate, 
													rd.EndDate, 
													ec.AssignedVehicleId, 
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
            JSON_OBJECT("assignedVehicleId", IF(rd.ReleaseDetailsId IS NULL, ec.assignedVehicleId, rd.assignedVehicleId)),
			JSON_OBJECT("ambulanceAssignmentTime", DATE_FORMAT(IF(rd.ReleaseDetailsId IS NULL, ec.ambulanceAssignmentTime, rd.ambulanceAssignmentTime), "%Y-%m-%dT%H:%i:%s")),
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
	INNER JOIN AAU.Emergencycaller ecr ON ecr.CallerId = c.CallerId
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

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues!!

-- CALL AAU.sp_GetOutstandingRescues('Jim')

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
WHERE p.OrganisationId = vOrganisationId
AND p.PatientCallOutcomeId IS NULL
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
				rd.AssignedVehicleId, 
                rd.PickupDate,
				rd.BeginDate, 
				rd.EndDate, 
				ec.AssignedVehicleId, 
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
            IF(rd.ReleaseDetailsId IS NULL, ec.Rescuer1Id, rd.Releaser1Id) AS Staff1Id,
			IF(rd.ReleaseDetailsId IS NULL, ec.Rescuer2Id, rd.Releaser2Id) AS Staff2Id,
            IF(rd.ReleaseDetailsId IS NULL, ec.assignedVehicleId, rd.assignedVehicleId) AS assignedVehicleId,
            IF(rd.ReleaseDetailsId IS NULL, ec.ambulanceAssignmentTime, rd.ambulanceAssignmentTime) AS ambulanceAssignmentTime,
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
    s1.Initials AS Staff1Initials,
    s2.Initials AS Staff2Initials,    
    JSON_OBJECT("ambulanceAction", r.AmbulanceAction) AS AmbulanceAction,
    JSON_OBJECT("ambulanceAssignment",
    JSON_ARRAYAGG(
    JSON_MERGE_PRESERVE(
    JSON_OBJECT("actionStatus", IFNULL(r.ActionStatus,'')),
    JSON_OBJECT("ambulanceAction", IFNULL(r.AmbulanceAction,'')),    
	JSON_OBJECT("releaseId", r.ReleaseDetailsId),
    JSON_OBJECT("requestedDate", DATE_FORMAT(r.RequestedDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseType", CONCAT(IF(r.ReleaseDetailsId IS NULL,"","Normal"), IF(IFNULL(r.ComplainerNotes,"") <> ""," + Complainer special instructions",""), IF(r.Releaser1Id IS NULL,"",CONCAT(" + Specific staff (", s1.Initials, " / ", s2.Initials,")")), IF(r.StreetTreatCaseId IS NULL,""," + StreetTreat release"))),
	JSON_OBJECT("pickupDate", DATE_FORMAT(r.PickupDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseBeginDate", DATE_FORMAT(r.BeginDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseEndDate", DATE_FORMAT(r.EndDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("staff1", r.Staff1Id),
	JSON_OBJECT("staff2", r.Staff2Id),
    JSON_OBJECT("assignedVehicleId", r.assignedVehicleId),
    JSON_OBJECT("ambulanceAssignmentTime", DATE_FORMAT(r.ambulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s")),
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
LEFT JOIN UserCTE s1 ON s1.UserId = r.Staff1Id
LEFT JOIN UserCTE s2 ON s2.UserId = r.Staff2Id
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
JSON_OBJECT("staff1Abbreviation", ag.Staff1Initials) AS Staff1Initials,
JSON_OBJECT("staff2", ag.Staff2Id) AS Staff2Id,
JSON_OBJECT("staff2Abbreviation", ag.Staff2Initials) AS Staff2Initials,
JSON_OBJECT("actions", 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
ag.AmbulanceAction,
ag.ambulanceAssignment))) AS ActionGroups
FROM actionsCTE ag
GROUP BY
ag.ActionStatus,
ag.Staff1Id,
ag.Staff1Initials,
ag.Staff2Id,
ag.Staff2Initials
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetReleaseDetailsById!!

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


IF vReleaseDetailsIdExists > 0 THEN
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
		-- "Releaser1",rd.Releaser1Id, 
		-- "Releaser2",rd.Releaser2Id,
        "assignedVehicleId", rd.AssignedVehicleId,
        "ambulanceAssignmentTime", DATE_FORMAT(rd.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s"), 
        "releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"),
		"releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"),
		"releaseEndDate", DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")
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

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRescueDetailsByEmergencyCaseId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetRescueDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.

Modifed By: Jim Mackenzie
Modified On: 27/06/2021
Modification: Altered to return Vehicle ID and rescuer details array
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
JSON_OBJECT("callOutcome",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallOutcomeId", p.PatientCallOutcomeId),
JSON_OBJECT("callOutcome", c.CallOutcome)
)
),
JSON_OBJECT("rescueDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("ambulanceArrivalTime", DATE_FORMAT(ec.AmbulanceArrivalTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_FORMAT(ec.RescueTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("assignedVehicleId", ec.assignedVehicleId),
JSON_OBJECT("ambulanceAssignmentTime", DATE_FORMAT(ec.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescuers", RescuerDetails)
))

) AS Result

FROM AAU.EmergencyCase ec
LEFT JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
LEFT JOIN AAU.CallOutcome c ON c.CallOutcomeId = p.PatientCallOutcomeId
LEFT JOIN
	(
		SELECT
		v.VehicleId,
        vs.StartDate,
        vs.EndDate,
		JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
        JSON_OBJECT("rescuerId", u.UserId),
		JSON_OBJECT("rescuerFirstName", u.FirstName),
        JSON_OBJECT("rescuerSurname", u.Surname),        
		JSON_OBJECT("rescuerInitials", u.Initials),
		JSON_OBJECT("rescuerColour", u.Colour))
		) AS `RescuerDetails`
		FROM AAU.Vehicle v
		INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId
		INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
		INNER JOIN AAU.User u ON u.UserId = vsu.UserId
		GROUP BY v.VehicleId,
        vs.StartDate,
        vs.EndDate
	) vdt ON ec.AmbulanceAssignmentTime >= vdt.StartDate
    AND CURDATE() <= IFNULL(vdt.EndDate, CURDATE())
	AND vdt.VehicleId = ec.AssignedVehicleId
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId
GROUP BY ec.EmergencyCaseId;

END$$

DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUsersByJobTypeId !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetUsersByJobTypeId(IN prm_Username VARCHAR(45), IN prm_JobTypeId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to return user 
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT jt.UserId AS `userId`, u.FirstName AS `firstName`, u.Surname AS `surname`, u.initials AS `initials`, u.Colour AS `Colour`
FROM AAU.UserJobType jt
INNER JOIN AAU.User u ON u.UserId = jt.UserId
WHERE jt.JobTypeId = prm_JobTypeId
AND u.OrganisationId = vOrganisationId
AND u.isDeleted = 0;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleListRange !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleListRange(IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 19/05/2021
Purpose: To get the list of Vehicle To display them in a table.
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE u.UserName = prm_Username LIMIT 1;

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
	JSON_OBJECT("vehicleId", vehicleDetails.VehicleId),
	JSON_OBJECT("registrationNumber", vehicleDetails.VehicleRegistrationNumber),
	JSON_OBJECT("vehicleNumber", vehicleDetails.VehicleNumber),
	JSON_OBJECT("vehicleTypeId", vehicleDetails.VehicleTypeId),
	JSON_OBJECT("vehicleType", vehicleDetails.VehicleType),
	JSON_OBJECT("largeAnimalCapacity", vehicleDetails.LargeAnimalCapacity),
	JSON_OBJECT("smallAnimalCapacity", vehicleDetails.SmallAnimalCapacity),
    JSON_OBJECT("minRescuerCapacity", vehicleDetails.MinRescuerCapacity),
	JSON_OBJECT("maxRescuerCapacity", vehicleDetails.MaxRescuerCapacity),
	JSON_OBJECT("vehicleStatusId", vehicleDetails.VehicleStatusId),
	JSON_OBJECT("vehicleStatus", vehicleDetails.VehicleStatus),
    JSON_OBJECT("imageURL", vehicleDetails.VehicleImage)
)) AS vehicleList
FROM
(SELECT vl.VehicleId,
	vl.VehicleRegistrationNumber,
	vl.VehicleNumber,
	vl.VehicleTypeId,
	vt.VehicleType,
	vl.LargeAnimalCapacity,
	vl.SmallAnimalCapacity,
    vl.MinRescuerCapacity,
    vl.MaxRescuerCapacity,
	vl.VehicleStatusId,
	vs.VehicleStatus,
    vl.VehicleImage
FROM AAU.Vehicle vl
INNER JOIN AAU.VehicleType vt ON vt.VehicleTypeId = vl.VehicleTypeId
INNER JOIN AAU.VehicleStatus vs ON vs.VehicleStatusId = vl.VehicleStatusId
WHERE vl.isDeleted = 0
AND vl.OrganisationId = vOrganisationId
) vehicleDetails;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationHistory!!

DELIMITER $$

-- CALL AAU.sp_GetVehicleLocationHistory('Jim', 1);

CREATE PROCEDURE AAU.sp_GetVehicleLocationHistory(IN prm_UserName VARCHAR(45), IN prm_VehicleId INT)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
JSON_OBJECT("vehicleId", VehicleId,
"locationHistory", 
JSON_ARRAYAGG(
JSON_OBJECT(
"timestamp", Timestamp,
"speed", Speed,
"heading", Heading,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", Latitude),
JSON_OBJECT("lng", Longitude))
))) AS `locationByVehicleId`
FROM AAU.VehicleLocation
WHERE CAST(Timestamp AS DATE) = CAST(CURDATE()-2 AS DATE)
AND OrganisationId = vOrganisationId
AND VehicleId = prm_VehicleId
GROUP BY VehicleId;


END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationHistory!!

DELIMITER $$

-- CALL AAU.sp_GetVehicleLocationHistory('Jim', 1);

CREATE PROCEDURE AAU.sp_GetVehicleLocationHistory(IN prm_UserName VARCHAR(45), IN prm_VehicleId INT)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH LocationHistoryCTE AS
(
SELECT
vl.VehicleId,
	JSON_ARRAYAGG(
		JSON_OBJECT(
		"timestamp", vl.Timestamp,
		"speed", vl.Speed,
		"heading", vl.Heading,
		"accuracy", vl.Accuracy,
		"altitude", vl.Altitude,
		"altitudeAccuracy", vl.AltitudeAccuracy,
		"latLng",
		JSON_MERGE_PRESERVE(
		JSON_OBJECT("lat", vl.Latitude),
		JSON_OBJECT("lng", vl.Longitude))
	)) AS `locationByVehicleId`
FROM AAU.VehicleLocation vl
WHERE CAST(vl.`Timestamp` AS DATE) = '2021-07-04'
AND OrganisationId = vOrganisationId
AND VehicleId = prm_VehicleId
GROUP BY vl.VehicleId
)

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT(
"vehicleDetails",
	JSON_OBJECT(
	"vehicleId", v.VehicleId,
	"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
	"vehicleNumber", v.VehicleNumber,
	"smallAnimalCapacity", v.SmallAnimalCapacity,
	"largeAnimalCapacity", v.LargeAnimalCapacity,
	"vehicleImage", v.VehicleImage,
	"vehicleTypeId", v.VehicleTypeId)),
JSON_OBJECT(
"vehicleLocation",
	JSON_OBJECT("locationHistory", lh.locationByVehicleId))) AS `vehicleLocationHistory`
FROM AAU.Vehicle v
INNER JOIN LocationHistoryCTE lh ON lh.VehicleId = v.VehicleId;


END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleShiftDetails !!

DELIMITER $$

-- CALL AAU.sp_GetVehicleShiftDetails('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_GetVehicleShiftDetails(IN prm_Username VARCHAR(45), IN prm_ShiftDate DATE ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to bring back the details of shifts by vehicle
*/

WITH ShiftCTE AS
(
SELECT
vs.VehicleShiftId,
JSON_OBJECT(
"vehicleId", vs.VehicleId,
"vehicleShiftId", vs.VehicleShiftId,
"shiftStartTime", DATE_FORMAT(vs.StartDate, "%Y-%m-%dT%H:%i:%s"),
"shiftEndTime", DATE_FORMAT(vs.EndDate, "%Y-%m-%dT%H:%i:%s"),
"isDeleted", vs.IsDeleted) AS `shiftDetails`

FROM AAU.VehicleShift vs
WHERE prm_ShiftDate BETWEEN CAST(vs.StartDate AS DATE) AND CAST(IFNULL(vs.EndDate, NOW()) AS DATE)
AND IFNULL(vs.IsDeleted,0) = 0
),
UserCTE AS
(
SELECT	vsu.VehicleShiftId,
		JSON_ARRAYAGG(
		JSON_OBJECT("userId", u.UserId,
		"firstName", u.FirstName,
		"surname", u.Surname,
		"initials", u.Initials,
		"colour", u.Colour)) AS `userDetails`
FROM AAU.VehicleShiftUser vsu
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vsu.VehicleShiftId IN (SELECT VehicleShiftId FROM ShiftCTE)
AND IFNULL(vsu.IsDeleted,0) = 0
GROUP BY vsu.VehicleShiftId
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
s.shiftDetails,
JSON_OBJECT("vehicleStaff", u.userDetails)
)) AS `vehicleShiftDetails`
FROM ShiftCTE s
LEFT JOIN UserCTE u ON u.VehicleShiftId = s.VehicleShiftId;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.p_GetVehiclesListDropdown!!

-- CALL AAU.p_GetVehiclesListDropdown('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.p_GetVehiclesListDropdown(IN prm_Username VARCHAR(65))
BEGIN

/* 
Created By: Arpit Trivedi
CreatedDate: 07/06/2021
Purpose: To get the list of vehicle for dropdown

Modified By: Jim Mackenzie
Modified On: 2021/07/04
Purpose: Adding current rescuers to the ambulance name
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId
FROM AAU.User
WHERE UserName = prm_Username LIMIT 1;

SELECT
v.VehicleId AS vehicleId,
v.VehicleRegistrationNumber AS vehicleRegistrationNumber,
CONCAT(v.VehicleNumber, vsu.VehicleStaff) AS vehicleNumber
FROM AAU.Vehicle v
LEFT JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId AND
CURDATE() >= vs.StartDate AND
CURDATE() <= IFNULL(vs.EndDate, CURDATE())
LEFT JOIN
(
SELECT VehicleShiftId, CONCAT(" - (",GROUP_CONCAT(u.Initials),")") AS VehicleStaff
FROM AAU.VehicleShiftUser vsu
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
GROUP BY VehicleShiftId
) vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
WHERE v.OrganisationId = vOrganisationId;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleType !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleType(IN prm_Username VARCHAR(45))
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate:17/05/2021
Purpose: To get the list of vehicle type list.
*/

SELECT VehicleTypeId, VehicleType FROM AAU.VehicleType;

END$$
DELIMITER ;
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
									-- IN prm_CallOutcomeId INT,
                                    -- IN prm_SameAsNumber INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DECIMAL(11,8),
									IN prm_Longitude DECIMAL(11,8),
									-- IN prm_Rescuer1Id INT,
									-- IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_AssignedAmbulanceId INT,
                                    IN prm_AmbulanceAssignmentTime DATETIME)
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

IF Prm_EmergencyNumber = -1 THEN

	SELECT (MIN(EmergencyNumber) - 1) INTO DummyEmNo 
    FROM AAU.EmergencyCase WHERE EmergencyNumber < 0;
    
ELSE 
	SELECT Prm_EmergencyNumber INTO DummyEmNo;

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

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

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
	-- CallOutcomeId,
    -- SameAsEmergencyCaseId,
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
    GUID,
    AssignedVehicleId,
    AmbulanceAssignmentTime
)
VALUES
(
	vOrganisationId,
	-- prm_EmergencyNumber,
    DummyEmNo,
	prm_CallDateTime,
	prm_DispatcherId,
	prm_EmergencyCodeId,
	-- prm_CallOutcomeId,
    -- vSameAsEmergencyCaseId,
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
    prm_GUID,
    prm_AssignedAmbulanceId,
    prm_AmbulanceAssignmentTime
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

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertReleaseDetails!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertReleaseDetails(IN prm_UserName NVARCHAR(45),
												IN prm_PatientId INT,
												IN prm_ComplainerNotes NVARCHAR(450),
												IN prm_ComplainerInformed TINYINT,
												IN prm_Releaser1Id INT,
												IN prm_Releaser2Id INT,
												IN prm_RequestedUser NVARCHAR(45),
												IN prm_RequestedDate DATETIME
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleListItem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertVehicleListItem(
												IN prm_Username VARCHAR(65),
												IN prm_VehicleRegistrationNumber VARCHAR(100),
												IN prm_VehicleNumber VARCHAR(100),
												IN prm_VehicleTypeId INT,
												IN prm_LargeAnimalCapacity INT,
												IN prm_SmallAnimalCapacity INT,
                                                IN prm_MinRescuerCapacity INT,
												IN prm_MaxRescuerCapacity INT,
												IN prm_VehicleStatusId INT
                                            )
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate: 18/05/2021
Purpose: To insert the vehicle record
*/

DECLARE	vVehicleCount INT;
DECLARE vSuccess INT;
DECLARE vVehicleId INT;

SELECT COUNT(1) INTO vVehicleCount
FROM AAU.Vehicle
WHERE VehicleNumber = prm_VehicleNumber 
AND VehicleRegistrationNumber = prm_VehicleRegistrationNumber;

IF vVehicleCount = 0 THEN
	
    INSERT INTO AAU.Vehicle (
		VehicleRegistrationNumber,
		VehicleNumber,
		VehicleTypeId,
		LargeAnimalCapacity,
		SmallAnimalCapacity,
        MinRescuerCapacity,
        MaxRescuerCapacity,
		VehicleStatusId
	)
	VALUES(
		prm_VehicleRegistrationNumber,
        prm_VehicleNumber,
        prm_VehicleTypeId,
        prm_LargeAnimalCapacity,
        prm_SmallAnimalCapacity,
        prm_MinRescuerCapacity,
        prm_MaxRescuerCapacity,
        prm_VehicleStatusId
	);
    
	SELECT LAST_INSERT_ID(), 1 INTO vVehicleId, vSuccess;
    
ELSEIF vVehicleCount > 0 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;


END IF; 

SELECT vVehicleId AS vehicleId, vSuccess AS success;
	
END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleShift!!

DELIMITER $$

-- CALL AAU.sp_InsertVehicleShift('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_InsertVehicleShift(IN prm_Username VARCHAR(45), IN prm_VehicleShiftId INT, IN prm_VehicleId INT, IN prm_StartDate DATETIME, IN prm_EndDate DATETIME ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to insert a new shift for a vehicle
*/

DECLARE vOrganisationId INT;
DECLARE vVehicleShiftIdCount INT;
DECLARE vSuccess INT;

SET vSuccess = 0;
SET vVehicleShiftIdCount = 0;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vVehicleShiftIdCount FROM AAU.VehicleShift WHERE VehicleShiftId = prm_VehicleShiftId;

IF vVehicleShiftIdCount = 0 THEN

INSERT INTO AAU.VehicleShift (
		OrganisationId,
		VehicleId,
		StartDate,
		EndDate
	)
	VALUES (
		vOrganisationId,
		prm_VehicleId,
		prm_StartDate,
		prm_EndDate
	);
    
    SELECT LAST_INSERT_ID() INTO prm_VehicleShiftId;
    SELECT 1 INTO vSuccess;
    
ELSE
    SELECT 0 INTO vSuccess;
END IF;
    
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCase !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateEmergencyCase(
									IN prm_EmergencyCaseId INT,
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									-- IN prm_CallOutcomeId INT,
                                    -- IN prm_SameAsNumber INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DOUBLE(11,8),
									IN prm_Longitude DECIMAL(11,8),
									-- IN prm_Rescuer1Id INT,
									-- IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_IsDeleted BOOLEAN,
                                    IN prm_DeletedDate DATETIME,
									IN prm_UserName VARCHAR(64),
                                    IN prm_AssignedAmbulanceId INT,
                                    IN prm_AmbulanceAssignmentTime DATETIME,
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

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

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
						-- CallOutcomeId          = prm_CallOutcomeId,
                        -- SameAsEmergencyCaseId  = vSameAsEmergencyCaseId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						-- Rescuer1Id             = prm_Rescuer1Id,
						-- Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted,
                        DeletedDate			   = prm_DeletedDate,
                        UpdateTime			   = prm_UpdateTime,
                        Comments			   = prm_Comments,
                        AssignedVehicleId    = prm_AssignedAmbulanceId,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime
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

DROP PROCEDURE IF EXISTS AAU.sp_UpdateReleaseDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateReleaseDetails(IN prm_Username VARCHAR(45),
											IN prm_ReleaseId INT,
											IN prm_EmergencyCaseId INT,
											IN prm_AssignedAmbulanceId INT,
											IN prm_AmbulanceAssignmentTime DATETIME,
											IN prm_Pickupdate DATETIME,
											IN prm_BeginDate DATETIME,
											IN prm_EndDate DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/20
Purpose: Used to update a release of a patient.
*/

DECLARE vUpdateSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vPatientId INT;
DECLARE vSocketEndPoint CHAR(3);

SELECT SocketEndPoint INTO vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1), MAX(PatientId) INTO vReleaseCount, vPatientId FROM AAU.ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseId;

IF vReleaseCount = 1 THEN

UPDATE AAU.ReleaseDetails
				SET -- Releaser1Id = prm_Releaser1Id,
                    -- Releaser2Id = prm_Releaser2Id,
                    AssignedVehicleId = prm_AssignedAmbulanceId,
                    AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime,
                    Pickupdate = prm_PickupDate,
                    BeginDate = prm_BeginDate,
                    EndDate = prm_EndDate
WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT 1 INTO vUpdateSuccess;

ELSEIF vReleaseCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- Release Doesn't exist

ELSEIF vReleaseCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

END IF;

SELECT vUpdateSuccess AS updateSuccess, vSocketEndPoint AS socketEndPoint;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, vPatientId);

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleListItem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVehicleListItem(IN prm_Username VARCHAR(65),
								 IN prm_VehicleId INT,
								 IN prm_VehicleRegistrationNumber VARCHAR(100),
								 IN prm_VehicleNumber VARCHAR(100),
								 IN prm_VehicleTypeId INT,
								 IN prm_LargeAnimalCapacity INT,
								 IN prm_SmallAnimalCapacity INT,
                                 IN prm_MinRescuerCapacity INT,
                                 IN prm_MaxRescuerCapacity INT,
								 IN prm_VehicleStatusId INT)
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate: 18/05/2021
Purpose: To update the vehicle record
*/

DECLARE vSuccess INT;
DECLARE vVehicleCount INT;

SET vSuccess = 0;
SET vVehicleCount = 0;

SELECT COUNT(1) INTO vVehicleCount FROM AAU.Vehicle
WHERE VehicleId = prm_VehicleId;

IF vVehicleCount = 1 THEN

	UPDATE AAU.Vehicle SET
		VehicleRegistrationNumber = prm_VehicleRegistrationNumber,
		VehicleNumber = prm_VehicleNumber,
		VehicletypeId = prm_VehicleTypeId,
		LargeAnimalCapacity = prm_LargeAnimalCapacity,
		SmallAnimalCapacity = prm_SmallAnimalCapacity,
        MinRescuerCapacity = prm_MinRescuerCapacity,
		MaxRescuerCapacity = prm_MaxRescuerCapacity,
		VehicleStatusId = prm_VehicleStatusId
	WHERE VehicleId = prm_VehicleId;
    
    SELECT 1 INTO vSuccess;

ELSE 
	
    SELECT 2 INTO vSuccess;
    
END IF;

SELECT prm_VehicleId AS vehicleId, vSuccess AS success;
    

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleShiftStaff!!

DELIMITER $$

-- CALL AAU.sp_UpdateVehicleShiftStaff('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_UpdateVehicleShiftStaff(IN prm_VehicleShiftId INT, IN prm_UserList VARCHAR(1000) ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to insert users for a shift. This procedures also soft deletes any existing users on the shift.
*/

DECLARE vUpdated INT;
DECLARE vInserted INT;
DECLARE vSuccess INT;

SET vUpdated = -1;
SET vInserted = -1;
SET vSuccess = 0;

WITH IncomingUserCTE AS
(
SELECT prm_VehicleShiftId, UserId
FROM
  JSON_TABLE(
    prm_UserList,
    "$[*]" COLUMNS(
      UserId VARCHAR(100) PATH "$.userId"
    )
  ) shiftUser
)

  -- Set all of the missing users to deleted
UPDATE AAU.VehicleShiftUser vsu
LEFT JOIN IncomingUserCTE iu ON vsu.vehicleShiftId = prm_VehicleShiftId AND iu.UserId = vsu.UserId
SET IsDeleted = 1, DeletedDate = NOW()
WHERE iu.UserId IS NULL
AND vsu.vehicleShiftId = prm_VehicleShiftId;

  SELECT ROW_COUNT() INTO vUpdated;
  
-- Now only insert the records that don't already exist
INSERT INTO AAU.VehicleShiftUser (VehicleShiftId, UserId) 
SELECT prm_VehicleShiftId, UserId
FROM
  JSON_TABLE(
    prm_UserList,
    "$[*]" COLUMNS(
      UserId VARCHAR(100) PATH "$.userId"
    )
  ) shiftUser
WHERE shiftUser.UserId NOT IN (SELECT UserId FROM AAU.VehicleShiftUser WHERE VehicleShiftId = prm_VehicleShiftId AND IFNULL(IsDeleted,0) = 0);
  
  SELECT ROW_COUNT() INTO vInserted;
  
  IF vInserted >= 0 OR vUpdated >= 0 THEN
	SET vSuccess = 1;
  END IF;
  
  
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';
		

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleShift!!

DELIMITER $$

-- CALL AAU.sp_UpdateVehicleShift('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_UpdateVehicleShift(IN prm_Username VARCHAR(45),
IN prm_VehicleShiftId INT,
IN prm_VehicleId INT,
IN prm_StartDate DATETIME,
IN prm_EndDate DATETIME,
IN prm_IsDeleted TINYINT) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to update an existing shift for a vehicle
*/

DECLARE vOrganisationId INT;
DECLARE vVehicleShiftId INT;
DECLARE vVehicleShiftIdCount INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vVehicleShiftId FROM AAU.VehicleShift WHERE VehicleShiftId = prm_VehicleShiftId;

IF vVehicleShiftId = 1 THEN

UPDATE AAU.VehicleShift SET
		OrganisationId = vOrganisationId,
		VehicleId = prm_VehicleId,
		StartDate = prm_StartDate,
		EndDate = prm_EndDate,
        UpdateDate = NOW(),
        IsDeleted = prm_IsDeleted,
        DeletedDate = IF(prm_IsDeleted = 1, NOW(), NULL)
	WHERE VehicleShiftId = prm_VehicleShiftId;
    
    SELECT 1 INTO vSuccess;
    
ELSE
    SELECT 0 INTO vSuccess;
END IF;
    
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';

END$$

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
		IN prm_AnimalDescription VARCHAR(256),
        In prm_AssignedAmbulanceId INT,
        IN prm_AmbulanceAssignmentTime DATETIME
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

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

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
                        OrganisationId,
                        AssignedVehicleId,
                        AmbulanceAssignmentTime
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
                        vOrganisationId,
                        prm_AssignedAmbulanceId,
                        prm_AmbulanceAssignmentTime
						) ON DUPLICATE KEY UPDATE
                        PriorityId			= prm_PriorityId,
						StatusId			= prm_StatusId,
						TeamId				= prm_TeamId,
						MainProblemId		= prm_MainProblemId,
						AdminComments		= prm_AdminComments,
						OperatorNotes		= prm_OperatorNotes,
						ClosedDate			= prm_ClosedDate,
						EarlyReleaseFlag	= prm_EarlyReleaseFlag,
                        AssignedAmbulanceId = prm_AssignedAmbulanceId,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime;
                        
	SELECT 1 INTO vSuccess;
    
	SELECT StreetTreatCaseId INTO vStreetTreatCaseId FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;

    UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreetTreatCaseId,'Case','Upsert', NOW());
	SELECT vStreetTreatCaseId AS streetTreatCaseId, vSuccess AS success;
END$$

DELIMITER ;


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserPermissionsByUsername !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserPermissionsByUsername(IN prm_Username VARCHAR(45))
BEGIN

SELECT PermissionArray FROM AAU.User
WHERE Username = prm_Username;

END$$

DELIMITER ;