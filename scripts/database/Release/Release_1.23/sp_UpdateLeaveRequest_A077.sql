DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateLeaveRequest !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateLeaveRequest( 	IN prm_UserName VARCHAR(45),
												IN prm_LeaveRequestId INTEGER,
												IN prm_DepartmentId INTEGER,
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
                                                IN prm_FestivalId INT,
												IN prm_IsDeleted TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 16/11/2022
Purpose: Update a leave request

*/

DECLARE vLeaveRequestExists INT;
DECLARE vSuccess INT;

SET vLeaveRequestExists = 0;
SET vSuccess = 0;

	SELECT COUNT(1) INTO vLeaveRequestExists FROM AAU.LeaveRequest WHERE LeaveRequestId = prm_LeaveRequestId;
    
    IF(vLeaveRequestExists = 1) THEN
    
	UPDATE AAU.LeaveRequest SET
		LeaveRequestId				= prm_LeaveRequestId,
		UserId						= prm_UserId,
		RequestDate					= prm_RequestDate,
		LeaveRequestReasonId		= prm_LeaveRequestReasonId,
		AdditionalInformation		= prm_AdditionalInformation,
		LeaveStartDate				= prm_LeaveStartDate,
		LeaveEndDate				= prm_LeaveEndDate,
		Granted						= prm_Granted,
		CommentReasonManagementOnly = prm_CommentReasonManagementOnly,
		DateApprovedRejected		= prm_DateApprovedRejected,
		RecordedOnNoticeBoard		= prm_RecordedOnNoticeBoard,
        WithinProtocol				= prm_WithinProtocol,
        FestivalId					= prm_FestivalId,
		IsDeleted					= prm_IsDeleted
	WHERE LeaveRequestId = prm_LeaveRequestId;
    
    SELECT 1 INTO vSuccess;
    
    	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (prm_Username,prm_LeaveRequestId,'Leave Request','Update', NOW());
    
    ELSE
    
    SELECT 2 INTO vSuccess; 
    
    END IF;
    
    SELECT vSuccess AS `success`, prm_LeaveRequestId AS `leaveRequestId`;
    

END$$