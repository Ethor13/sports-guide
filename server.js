import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

// Get Cable Providers in Zipcode
// API endpoint to fetch zipcode data
app.get("/api/zipcode/:zipcode", async (req, res) => {
	const { zipcode } = req.params;
	const externalApiUrl = `https://backend.tvguide.com/tvschedules/tvguide/serviceproviders/zipcode/${zipcode}/web?apiKey=DI9elXhZ3bU6ujsA2gXEKOANyncXGUGc`;

	try {
		const response = await fetch(externalApiUrl);
		if (!response.ok) {
			throw new Error("Failed to fetch data from the external API");
		}

		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get Channels
app.get("/api/serviceprovider/:serviceprovider", async (req, res) => {
	const { serviceprovider } = req.params;
	const externalApiUrl = `https://backend.tvguide.com/tvschedules/tvguide/serviceprovider/${serviceprovider}/sources/web?apiKey=DI9elXhZ3bU6ujsA2gXEKOANyncXGUGc`;

	try {
		const response = await fetch(externalApiUrl);
		if (!response.ok) {
			throw new Error("Failed to fetch data from the external API");
		}

		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get Channel Schedule
app.get("/api/channels/:serviceprovider", async (req, res) => {
	const { serviceprovider } = req.params;
	const externalApiUrl = `https://backend.tvguide.com/tvschedules/tvguide/${serviceprovider}/web`;

	try {
		const response = await fetch(externalApiUrl);
		if (!response.ok) {
			throw new Error("Failed to fetch data from the external API");
		}

		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
