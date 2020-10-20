DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertCrueltyReport!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertCrueltyReport(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_CrueltyDate DATE,
									IN prm_CrueltyReport NVARCHAR(2000),
									IN prm_PostCrueltyReport NVARCHAR(2000),
									IN prm_CrueltyCode VARCHAR(64),
									IN prm_AnimalCondition VARCHAR(64),
									IN prm_CrueltyInspectorUserId INT,
									IN prm_NameOfAccused VARCHAR(128),
									IN prm_MobileNumberOfAccused VARCHAR(64),
									IN prm_FIRNumber VARCHAR(64),
									IN prm_Act VARCHAR(64),
									IN prm_PoliceComplaintNumber VARCHAR(64),
									IN prm_PoliceStation VARCHAR(256),
									IN prm_PoliceOfficerName VARCHAR(128),
									IN prm_PoliceOfficerDesignation VARCHAR(64),
									IN prm_PoliceOfficerNumber VARCHAR(64),
									IN prm_ActionTaken VARCHAR(1000),
									IN prm_AnimalLocationAfterAction VARCHAR(1000)
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/07/2020
Purpose: Used to insert a new media item for a patient.
*/
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE vCrueltyReportId INT;

DECLARE vCrueltyReportExists INT;
SET vCrueltyReportExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vCrueltyReportExists FROM AAU.CrueltyReport WHERE PatientId = prm_PatientId;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vCrueltyReportExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.CrueltyReport
		(
		PatientId,
		CrueltyDate,
		CrueltyReport,
		PostCrueltyReport,
		CrueltyCode,
		AnimalCondition,
		CrueltyInspectorUserId,
		NameOfAccused,
		MobileNumberOfAccused,
		FIRNumber,
		Act,
		PoliceComplaintNumber,
		PoliceStation,
		PoliceOfficerName,
		PoliceOfficerDesignation,
		PoliceOfficerNumber,
		ActionTaken,
		AnimalLocationAfterAction  
		)
		VALUES
		(
		prm_PatientId,
		prm_CrueltyDate,
        prm_CrueltyReport,
		prm_PostCrueltyReport,
		prm_CrueltyCode,
		prm_AnimalCondition,
		prm_CrueltyInspectorUserId,
		prm_NameOfAccused,
		prm_MobileNumberOfAccused,
		prm_FIRNumber,
		prm_Act,
		prm_PoliceComplaintNumber,
		prm_PoliceStation,
		prm_PoliceOfficerName,
		prm_PoliceOfficerDesignation,
		prm_PoliceOfficerNumber,
		prm_ActionTaken,
		prm_AnimalLocationAfterAction
		);
        
COMMIT;

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vCrueltyReportId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vCrueltyReportId,'Cruelty Report','Insert', NOW());

ELSEIF vCrueltyReportExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE
	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS success, vCrueltyReportId AS crueltyReportId;


END