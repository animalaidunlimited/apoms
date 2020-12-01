DELIMITER $$

DROP PROCEDURE IF EXISTS AAU.sp_InsertReleaseDetails;

CREATE PROCEDURE AAU.sp_InsertReleaseDetails (IN prm_UserName NVARCHAR(45),
												IN prm_PatientId INT,
												IN prm_ReleaseTypeId INT,
												IN prm_ComplainerNotes NVARCHAR(450),
												IN prm_ComplainerInformed TINYINT,
												IN prm_Releaser1Id INT,
												IN prm_Releaser2Id INT,
												IN prm_RequestedUser NVARCHAR(45),
												IN prm_RequestedDate DATE,
												IN prm_CallerId INT
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
SET vReleaseCount = 0;
SET vOrganisationId = 1;
SET vReleaseId = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vReleaseCount FROM AAU.ReleaseDetails WHERE PatientId = prm_PatientId;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_UserName LIMIT 1;
 
IF vReleaseCount = 0 THEN

INSERT INTO AAU.ReleaseDetails (OrganisationId,
								PatientId,
                                RequestedUser,
                                RequestedDate,
                                ReleaseTypeId,
                                CallerId,
                                ComplainerNotes,
                                ComplainerInformed,
                                Releaser1Id,
                                Releaser2Id)
								VALUES
                                (vOrganisationId,
                                prm_PatientId,
                                prm_RequestedUser,
                                prm_RequestedDate,
                                prm_ReleaseTypeId,
                                prm_CallerId,
                                prm_ComplainerNotes,
                                IF(prm_ComplainerInformed,1,0),
                                prm_Releaser1Id,
                                prm_Releaser2Id
                                );

SELECT LAST_INSERT_ID() INTO vReleaseId;
SELECT 1 INTO vSuccess;

ELSEIF vReleaseCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;


SELECT vReleaseId, vSuccess;

END$$
DELIMITER ;
