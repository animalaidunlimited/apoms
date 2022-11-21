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
												IN prm_EmergencyMedicalLeave TINYINT,
												IN prm_LeaveStartDate DATE,
												IN prm_LeaveEndDate DATE,
												IN prm_Granted TINYINT,
												IN prm_CommentReasonManagementOnly TEXT,
												IN prm_DateApprovedRejected DATETIME,
												IN prm_RecordedOnNoticeBoard TINYINT,
												IN prm_LeaveTaken TINYINT,
                                                IN prm_LeaveTakenComment TEXT,
                                                IN prm_DocumentOrMedicalSlipProvided TINYINT,
                                                IN prm_DocumentOrMedicalSlipAccepted TINYINT,
												IN prm_Comment TEXT,												
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
		LeaveRequestId = prm_LeaveRequestId,
		DepartmentId = prm_DepartmentId,
		UserId = prm_UserId,
		RequestDate = prm_RequestDate,
		LeaveRequestReasonId = prm_LeaveRequestReasonId,
		AdditionalInformation = prm_AdditionalInformation,
		EmergencyMedicalLeave = prm_EmergencyMedicalLeave,
		LeaveStartDate = prm_LeaveStartDate,
		LeaveEndDate = prm_LeaveEndDate,
		Granted = prm_Granted,
		CommentReasonManagementOnly = prm_CommentReasonManagementOnly,
		DateApprovedRejected = prm_DateApprovedRejected,
		RecordedOnNoticeBoard = prm_RecordedOnNoticeBoard,
		LeaveTaken = prm_LeaveTaken,
        LeaveTakenComment = prm_LeaveTakenComment,
		DocumentOrMedicalSlipProvided = prm_DocumentOrMedicalSlipProvided,
        DocumentOrMedicalSlipAccepted = prm_DocumentOrMedicalSlipAccepted,
		Comment = prm_Comment,
		IsDeleted = prm_IsDeleted
	WHERE LeaveRequestId = prm_LeaveRequestId;
    
    SELECT 1 INTO vSuccess;
    
    	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (prm_Username,prm_LeaveRequestId,'Leave Request','Update', NOW());
    
    ELSE
    
    SELECT 2 INTO vSuccess; 
    
    END IF;
    
    SELECT vSuccess AS `success`, prm_LeaveRequestId AS `leaveRequestId`;
    

END$$