DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.fn_GetRescueStatus!!

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
			(AssignedRescueVehicleId IS NULL AND
            CallOutcomeId IS NULL AND
            ReleaseDetailsId IS NULL AND
            RequestedUser IS NULL AND
            RequestedDate IS NULL) 
            OR
            (AssignedRescueVehicleId IS NOT NULL AND
            CallOutcomeId IS NOT NULL AND
			ReleaseDetailsId IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            AssignedReleaseVehicleId IS NULL)
			THEN SET rescueReleaseStatus = 1;
            
        ELSEIF
			(AssignedRescueVehicleId IS NOT NULL AND
			AmbulanceArrivalTime IS NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL) 
            OR
            (AssignedRescueVehicleId IS NOT NULL AND
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
			(AssignedRescueVehicleId IS NOT NULL AND
            AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL)
            OR
            (AssignedRescueVehicleId IS NOT NULL AND
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
			(AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
			AdmissionTime IS NULL AND
			ReleaseDetailsId IS NULL)
            OR
            (AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NOT NULL AND 
            BeginDate IS NOT NULL AND
            EndDate IS NULL)
			THEN SET rescueReleaseStatus = 4;
            
		ELSEIF
			(AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NULL  AND
				(
				CallOutcomeId IS NULL OR
				InTreatmentAreaId IS NULL
				)
            ) 
            OR
            (AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NOT NULL AND 
            BeginDate IS NOT NULL AND 
            EndDate IS NULL)
			THEN SET rescueReleaseStatus = 5;
        
        
        END IF;
        
	-- return the rescue status
	RETURN (rescueReleaseStatus);
END!!