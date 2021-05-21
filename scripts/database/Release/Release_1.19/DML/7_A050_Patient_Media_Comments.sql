DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

CREATE TABLE AAU.PatientMediaComments (
  CommentId int NOT NULL AUTO_INCREMENT,
  UserId int DEFAULT NULL,
  Comment varchar(45) DEFAULT NULL,
  PatientMediaItemId int DEFAULT NULL,
  Timestamp datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (CommentId),
  KEY FK_PatientMediaCommentsUserId_UserUserId (UserId),
  KEY FK_PMCommentsPatientMediaItemId_PMItemPatientMediaItemId (PatientMediaItemId),
  CONSTRAINT FK_PatientMediaCommentsUserId_UserUserId FOREIGN KEY (UserId) REFERENCES AAU.User (UserId),
  CONSTRAINT FK_PMCommentsPatientMediaItemId_PMItemPatientMediaItemId FOREIGN KEY (PatientMediaItemId) REFERENCES PatientMediaItem (PatientMediaItemId)
);


END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	
