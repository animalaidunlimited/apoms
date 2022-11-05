DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertStreetTreatCase!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertStreetTreatCase(
		IN prm_Username VARCHAR(45),
		IN prm_PatientId INT,
		IN prm_PriorityId INT,
		IN prm_StatusId INT,		
		IN prm_MainProblemId INT,
		IN prm_AdminComments VARCHAR(256),
		IN prm_OperatorNotes VARCHAR(256),
		IN prm_ClosedDate DATE,
		IN prm_EarlyReleaseFlag BOOLEAN,
		IN prm_AnimalDescription VARCHAR(256),
        IN prm_AssignedVehicleId INT,
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

Created By: Jim Mackenzie
Created On: 19/09/2021
Purpose: Removed ON DUPLICATE KEY UPDATE as it would have never worked without a Unique key which is impossible to add.
*/

DECLARE vStreetTreatCaseId INT;
DECLARE vCaseExists INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;

SET vCaseExists = 0;

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId AND IsDeleted = 0;

IF vCaseExists = 0 THEN

INSERT INTO AAU.StreetTreatCase(
                        PatientId,
						PriorityId,
						StatusId,
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
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag,
                        vOrganisationId,
                        prm_AssignedVehicleId,
                        prm_AmbulanceAssignmentTime
						);
                        
SELECT 1 INTO vSuccess;

ELSEIF vCaseExists = 1 THEN

 UPDATE AAU.StreetTreatCase SET
                        PriorityId				= prm_PriorityId,
						StatusId				= prm_StatusId,
						AssignedVehicleId		= prm_AssignedVehicleId,
						MainProblemId			= prm_MainProblemId,
						AdminComments			= prm_AdminComments,
						OperatorNotes			= prm_OperatorNotes,
						ClosedDate				= prm_ClosedDate,
						EarlyReleaseFlag		= prm_EarlyReleaseFlag,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime
	WHERE PatientId = prm_PatientId AND IsDeleted = 0;

SELECT 1 INTO vSuccess;

ELSE

SELECT 2 INTO vSuccess;

END IF;	

	SELECT StreetTreatCaseId INTO vStreetTreatCaseId FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;

    UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vStreetTreatCaseId,'ST Case','Upsert', NOW());
    
	SELECT vStreetTreatCaseId AS streetTreatCaseId, vSuccess AS success;
    
END $$
DELIMITER ;
