DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateReleaseRequest!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateReleaseRequest(IN prm_UserName VARCHAR(45),
											IN prm_EmergencyCaseId INT,
											IN prm_ReleaseId INT,
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
Purpose: Used to update a release of a patient.
*/

DECLARE vUpdateSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vUserId INT;
DECLARE vSocketEndPoint CHAR(3);

SELECT COUNT(1) INTO vReleaseCount FROM AAU.ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT u.UserId, o.SocketEndPoint INTO vUserId, vSocketEndPoint 
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_RequestedUser LIMIT 1;

IF vReleaseCount = 1 THEN

UPDATE AAU.ReleaseDetails 
				SET ReleaseTypeId = prm_ReleaseTypeId,
					ComplainerNotes = prm_ComplainerNotes,
                    ComplainerInformed = IF(prm_ComplainerInformed,1,0),
                    Releaser1Id = prm_Releaser1Id,
                    Releaser2Id = prm_Releaser2Id,
                    RequestedUser = vUserId,
                    RequestedDate = prm_RequestedDate,
                    CallerId = prm_CallerId
WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT 1 INTO vUpdateSuccess;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_UserName,prm_ReleaseId,'Release','Update', NOW());

ELSEIF vReleaseCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- Release Doesn't exist

ELSEIF vReleaseCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

END IF;

SELECT vUpdateSuccess AS success, vSocketEndPoint AS socketEndPoint;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId);

END$$
