const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const _ = require("lodash");
const cors = require("cors");
const { getSortedScores, getMissingHeadersFromWorkSheet } = require("./helper");

const app = express();
const port = 3000;

app.use(cors());

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const requiredHeaders = [
      "Student ID",
      "Name",
      "Learning Objective",
      "Score",
      "Subject",
    ];

    const missingHeaders = getMissingHeadersFromWorkSheet(
      worksheet,
      requiredHeaders
    );

    if (missingHeaders.length > 0) {
      const error = `The file is missing required headers: ${missingHeaders.join(
        ", "
      )}`;
      res.status(400).json({ message: error });
      return;
    }

    // Convert the worksheet data to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: ["student_id", "name", "learning_objective", "score", "subject"],
    });

    const groupedData = _.groupBy(jsonData.slice(1), "student_id");

    // Create the final JSON response with sorting based on scores
    const jsonResponse = _.map(groupedData, (studentData) => {
      const sortedScores = getSortedScores(studentData);
      return {
        student_id: studentData[0].student_id,
        name: studentData[0].name,
        subject: studentData[0].subject,
        scores: _.map(sortedScores, (score) => ({
          learning_objective: score.learning_objective,
          score: score.score,
        })),
      };
    });

    res.status(200).json({
      success: true,
      data: jsonResponse,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error processing the file." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
