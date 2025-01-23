const fetchZipcodeData = async () => {
	const zipcode = document.getElementById("zipcode").value.trim();
	const resultsDiv = document.getElementById("results");

	if (!zipcode) {
		resultsDiv.innerHTML =
			'<p style="color: red;">Please enter a valid zipcode.</p>';
		return;
	}

	const apiUrl = `/api/zipcode/${zipcode}`; // Local server endpoint

	try {
		resultsDiv.innerHTML = "<p>Loading...</p>";

		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();

		if (data.data && data.data.items && Array.isArray(data.data.items)) {
			const names = await Promise.all(data.data.items.map(getPrograms));
			resultsDiv.innerHTML = `<p><strong>Names:</strong></p><p>${names.join(
				"<br>"
			)}</p>`;
		} else {
			resultsDiv.innerHTML = `<pre>${JSON.stringify(
				data,
				null,
				2
			)}</pre>`;
		}
	} catch (error) {
		resultsDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
	}
};

const getPrograms = async (item) => {
	const apiUrl = `/api/channels/${item.id}`;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();

		return (
			`<h1>${item.name}</h1>` +
			data.data.items
				.filter((item) => item.programSchedules[0].catId == 2)
				.map(
					(item) =>
						`Channel ${item.channel.number} ${item.channel.fullName} is playing ${item.programSchedules[0].title}`
				)
				.join("<br>")
		);
	} catch (error) {
		return null;
	}
};
