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