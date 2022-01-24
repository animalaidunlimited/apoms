DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertProblem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertProblem(
    IN prm_OrganisationId INT,
    IN prm_Problem VARCHAR(50),
    IN prm_IsDeleted INT,
    IN prm_SortOrder INT,
    IN prm_CreatedDate DATE,
    IN prm_ProblemStripped VARCHAR(50)
)
BEGIN
INSERT INTO AAU.Problem(
	OrganisationId,
	Problem,
	SortOrder,
	CreatedDate,
	IsDeleted,
	ProblemStripped
)
VALUES(
	prm_OrganisationId,
	prm_Problem,
	prm_SortOrder,
	prm_CreatedDate,
	prm_IsDeleted,
	prm_ProblemStripped
)ON DUPLICATE KEY UPDATE
OrganisationId = prm_OrganisationId,
Problem = prm_Problem,
SortOrder = prm_SortOrder,
CreatedDate = prm_CreatedDate,
IsDeleted = prm_IsDeleted,
ProblemStripped = REPLACE(ProblemStripped, " ","");

END $$