module.exports = {
	apps: [
		{
			name: "rig",
			script: "node build/index.js",
			env: {
				"PORT": 48950,
				"ORIGIN": "https://your.domain.here"
			}
		},
		{
			name: "rig_db",
			script: "start static/app/h2-1.4.197.jar",
			env: {
				"PORT": 48970
			}
		},
	]
}