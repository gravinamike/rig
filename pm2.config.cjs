module.exports = {
	apps: [
		{
			name: "rig",
			script: "node build/index.js"
		},
		{
			name: "rig_db",
			script: "sh static/app/start_db.sh"
		},
	]
}
