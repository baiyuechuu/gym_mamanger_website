const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
const PORT = dotenv.config().parsed?.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Serve static files from current directory

// API endpoint to save gym members data
app.post("/api/save-members", async (req, res) => {
	try {
		const { members } = req.body;

		if (!members || !Array.isArray(members)) {
			return res.status(400).json({
				success: false,
				message: "Invalid data format. Expected members array.",
			});
		}

		// Create the data object structure
		const dataToSave = {
			members: members,
		};

		// Write to the JSON file
		const filePath = path.join(__dirname, "data", "gym-members.json");
		await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), "utf8");

		res.json({
			success: true,
			message: "Members data saved successfully",
			count: members.length,
		});
	} catch (error) {
		console.error("Error saving members data:", error);
		res.status(500).json({
			success: false,
			message: "Failed to save data to file",
		});
	}
});

// API endpoint to get gym members data
app.get("/api/get-members", async (req, res) => {
	try {
		const filePath = path.join(__dirname, "data", "gym-members.json");
		const data = await fs.readFile(filePath, "utf8");
		const jsonData = JSON.parse(data);

		res.json({
			success: true,
			data: jsonData,
		});
	} catch (error) {
		console.error("Error reading members data:", error);
		res.status(500).json({
			success: false,
			message: "Failed to read data from file",
		});
	}
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
