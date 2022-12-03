
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLogs !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLogs( IN prm_recordIds TEXT)
BEGIN
	SELECT 
    UserName,
    ChangeTable,
    LoggedAction,
    DateTime AS Date,
    CONVERT(DateTime,TIME(0)) AS Time
    FROM AAU.Logging WHERE  FIND_IN_SET(RecordId,prm_recordIds);
END$$
DELIMITER ;
