require('module-alias/register');

const controller = require('common/controllers/db-controllers/DB_ApiKeyController');

(async () => {
    try {
        const name = process.argv[2];
        if (!name) {
            console.error("Usage: node create_api_key.js <name>");
            process.exit(1);
        }

        const key = await controller.create_api_key(name);
        console.log("Created API key for", name, ":", key.key);
        process.exit(0);
    }
    catch (error) {
        console.error("Error creating API key:", error);
        process.exit(1);
    }
})();