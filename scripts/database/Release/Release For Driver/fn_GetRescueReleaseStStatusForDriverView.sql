DELIMITER!!

DROP FUNCTION IF EXISTS AAU.fn_GetRescueReleaseStStatusForDriverView!!

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
