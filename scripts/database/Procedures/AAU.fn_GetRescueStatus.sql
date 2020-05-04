DELIMITER !!

DROP FUNCTION IF EXISTS AAU.fn_GetRescueStatus!!

DELIMITER $$
CREATE FUNCTION AAU.fn_GetRescueStatus(
	Rescuer1Id INT,
    Rescuer2Id INT,
    AmbulanceArrivalTime DATETIME,
    RescueTime DATETIME,
    AdmissionTime DATETIME,
    CallOutcomeId INT
) RETURNS int(11)
    DETERMINISTIC
BEGIN
    DECLARE rescueStatus INT;

		IF
			Rescuer1Id IS NULL AND
			Rescuer2Id IS NULL
			THEN SET rescueStatus = 1;
        ELSEIF
			Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NULL
			THEN SET rescueStatus = 2;
		ELSEIF
			Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NULL
			THEN SET rescueStatus = 3;
		ELSEIF
			Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NULL
			THEN SET rescueStatus = 4;
		ELSEIF
			Rescuer1Id IS NOT NULL AND
			Rescuer2Id IS NOT NULL AND
			AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            CallOutcomeId IS NULL
			THEN SET rescueStatus = 5;
        END IF;
        
	-- return the rescue status
	RETURN (rescueStatus);
END$$
DELIMITER ;
