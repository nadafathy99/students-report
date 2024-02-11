const _ = require("lodash");

function getSortedScores(studentData) {
  return _.sortBy(studentData, (subject) => {
    const { score } = subject;

    const numericRanking = _.isNumber(score) ? 8 - score + 1 : null;
    const letterRanking = _.isString(score)
      ? "abcdef".indexOf(score.toLowerCase()) + 1
      : null;
    const gradeRanking = _.isString(score)
      ? ["excellent", "good", "average", "poor", "very poor"].indexOf(
          score.toLowerCase()
        ) + 1
      : null;

    return numericRanking || letterRanking || gradeRanking;
  });
}

function getMissingHeadersFromWorkSheet(worksheet, requiredHeaders) {
  const requiredHeadersLength = requiredHeaders.length;
  const workSheetHeaders = Object.keys(worksheet)
    .map((key) => worksheet[key].v)
    .slice(0, requiredHeadersLength);

  const missingHeaders = requiredHeaders.filter(
    (header) => !workSheetHeaders.includes(header)
  );
  return missingHeaders;
}

module.exports = { getSortedScores, getMissingHeadersFromWorkSheet };
