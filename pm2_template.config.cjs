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
			script: "sh static/app/start_db.sh"
		},
	]
}