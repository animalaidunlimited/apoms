DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateCrueltyReport!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateCrueltyReport(
									IN prm_UserName VARCHAR(64),
									IN prm_CrueltyReportId INT,
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
									IN prm_AnimalLocationAfterAction VARCHAR(1000))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

DECLARE vCrueltyReportExists INT;
SET vCrueltyReportExists = 0;
SET vSuccess = 0;


SELECT COUNT(1) INTO vCrueltyReportExists FROM AAU.CrueltyReport WHERE CrueltyReportId = prm_CrueltyReportId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vCrueltyReportExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.CrueltyReport SET
				CrueltyDate					= prm_CrueltyDate,
				CrueltyReport				= prm_CrueltyReport,
				PostCrueltyReport			= prm_PostCrueltyReport,
				CrueltyCode					= prm_CrueltyCode,
				AnimalCondition				= prm_AnimalCondition,
				CrueltyInspectorUserId		= prm_CrueltyInspectorUserId,
				NameOfAccused				= prm_NameOfAccused,
				MobileNumberOfAccused		= prm_MobileNumberOfAccused,
				FIRNumber					= prm_FIRNumber,
				Act							= prm_Act,
				PoliceComplaintNumber		= prm_PoliceComplaintNumber,
				PoliceStation				= prm_PoliceStation,
				PoliceOfficerName			= prm_PoliceOfficerName,
				PoliceOfficerDesignation	= prm_PoliceOfficerDesignation,
				PoliceOfficerNumber			= prm_PoliceOfficerNumber,
				ActionTaken					= prm_ActionTaken,
				AnimalLocationAfterAction	= prm_AnimalLocationAfterAction
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO vSuccess;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_CrueltyReportId,'Cruelty Report',CONCAT('Update cruelty report'), NOW());

ELSEIF vCrueltyReportExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS success, prm_CrueltyReportId AS crueltyReportId;

END$$
DELIMITER ;
