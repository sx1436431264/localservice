var fs = require("fs");

module.exports = {
	cert: fs.readFileSync("./cert/cert.pem"),
	key: fs.readFileSync("./cert/key.pem"),
	passphrase: "test"
};
