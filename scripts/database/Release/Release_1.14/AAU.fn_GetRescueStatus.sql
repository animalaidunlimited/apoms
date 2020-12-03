DELIMITER $$

DROP FUNCTION IF EXISTS AAU.fn_GetRescueStatus;

CREATE FUNCTION AAU.fn_GetRescueStatus (
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
    CallOutcomeId INT  
) RETURNS int
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
            AmbulanceArrivalTime IS NOT NULL AND
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
            ReleaseDetailsId IS NULL) 
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NOT NULL AND
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
			AmbulanceArrivalTime IS NOT NULL AND
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
            AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NOT NULL AND
			AdmissionTime IS NULL AND
			ReleaseDetailsId IS NULL)
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NOT NULL AND
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
			AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            CallOutcomeId IS NULL AND
            ReleaseDetailsId IS NULL) 
            OR
            (Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NOT NULL AND
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
DELIMITER ;
