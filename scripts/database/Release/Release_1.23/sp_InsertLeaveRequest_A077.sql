DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertLeaveRequest !!

-- START TRANSACTION;
-- CALL AAU.sp_InsertLeaveRequest('Jim', 8,'2022-11-21', 4, NULL, NULL,'2022-11-22', '2022-11-25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,NULL);
-- ROLLBACK

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertLeaveRequest( 	IN prm_UserName VARCHAR(45),
												IN prm_UserId INTEGER,
												IN prm_RequestDate DATE,
												IN prm_LeaveRequestReasonId INTEGER,
												IN prm_AdditionalInformation TEXT,
												IN prm_LeaveStartDate DATE,
												IN prm_LeaveEndDate DATE,
												IN prm_Granted TINYINT,
												IN prm_CommentReasonManagementOnly TEXT,
												IN prm_DateApprovedRejected DATETIME,                                                
												IN prm_RecordedOnNoticeBoard TINYINT,
                                                IN prm_WithinProtocol TINYINT,
                                                IN prm_FestivalId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 16/11/2022
Purpose: Insert a leave request

*/

DECLARE vLeaveRequestExists INT;
DECLARE vSuccess INT;
DECLARE vLeaveRequestId INT;
DECLARE vOrganisationId INT;

SET vLeaveRequestExists = 0;
SET vSuccess = 0;
SET vLeaveRequestId = 0;
SET vOrganisationId = 0;

	SELECT OrganisationId INTO vOrganisationId
	FROM AAU.User u
	WHERE UserName = prm_UserName LIMIT 1;

	SELECT COUNT(1) INTO vLeaveRequestExists FROM AAU.LeaveRequest WHERE 	UserId = prm_UserId AND
																			LeaveRequestReasonId = prm_LeaveRequestReasonId AND
                                                                            LeaveStartDate = prm_LeaveStartDate AND
                                                                            LeaveEndDate = prm_LeaveEndDate
                                                                            AND IsDeleted = 0;
    
    IF(vLeaveRequestExists = 0) THEN    
    
	INSERT INTO AAU.LeaveRequest (
	UserId,
    OrganisationId,
	RequestDate,
	LeaveRequestReasonId,
	AdditionalInformation,
	LeaveStartDate,
	LeaveEndDate,
	Granted,
	CommentReasonManagementOnly,
	DateApprovedRejected,
	RecordedOnNoticeBoard,
    WithinProtocol,
    FestivalId
	)
	VALUES
	(
		prm_UserId,
        vOrganisationId,
		prm_RequestDate,
		prm_LeaveRequestReasonId,
		prm_AdditionalInformation,
		prm_LeaveStartDate,
		prm_LeaveEndDate,
		prm_Granted,
		prm_CommentReasonManagementOnly,
		prm_DateApprovedRejected,
		prm_RecordedOnNoticeBoard,
        prm_WithinProtocol,
        prm_FestivalId
	);
    
    SELECT LAST_INSERT_ID() INTO vLeaveRequestId;
    
    SELECT 1 INTO vSuccess;
    
    	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (prm_Username,vLeaveRequestId,'Leave Request','Insert', NOW());
    
    ELSE
    
    SELECT 2 INTO vSuccess; 
    
    END IF;
    
    SELECT vSuccess AS `success`, vLeaveRequestId AS `leaveRequestId`;
    

END$$