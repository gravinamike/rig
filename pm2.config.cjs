module.exports = {
	apps: [
		{
			name: "rig",
			script: "node -r dotenv/config build/index.js"
		},
		{
			name: "rig_db",
			script: "sh static/app/start_db.sh"
		},
	]
}
