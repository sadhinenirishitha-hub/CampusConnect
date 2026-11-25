const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 5000;

const usersFile = path.join(__dirname, "users.json");
const dataFile = path.join(__dirname, "data.json");

function initializeFile(file, defaultData) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    }
}

initializeFile(usersFile, []);

initializeFile(dataFile, {
    resources: [],
    groups: [],
    lostItems: []
});

function readJSON(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function send(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;

            if (body.length > 1000000) {
                reject(new Error("Request too large"));
            }
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);
    });
}

const routes = {
    "/api/resources": "resources",
    "/api/groups": "groups",
    "/api/lost-items": "lostItems"
};

const server = http.createServer(async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    const url = new URL(req.url, "http://localhost");
    const route = url.pathname;

    try {

        // HOME
        if (route === "/" && req.method === "GET") {
            return send(res, 200, {
                message: "CampusConnect Backend Working!"
            });
        }

        // REGISTER
        if (route === "/api/register" && req.method === "POST") {

            const { name, email, usn, department, password } =
                await readBody(req);

            if (!name || !email || !usn || !department || !password) {
                return send(res, 400, {
                    message: "All fields are required."
                });
            }

            if (password.length < 8) {
                return send(res, 400, {
                    message: "Password must be at least 8 characters."
                });
            }

            const users = readJSON(usersFile);

            if (users.some(user =>
                user.email.toLowerCase() === email.toLowerCase()
            )) {
                return send(res, 409, {
                    message: "Email already registered."
                });
            }

            const salt = crypto.randomBytes(16).toString("hex");

            const hashedPassword = crypto.scryptSync(
                password,
                salt,
                64
            ).toString("hex");

            users.push({
                id: crypto.randomUUID(),
                name,
                email,
                usn,
                department,
                salt,
                password: hashedPassword
            });

            writeJSON(usersFile, users);

            return send(res, 201, {
                message: "Registration successful!"
            });
        }

        // LOGIN
        if (route === "/api/login" && req.method === "POST") {

            const { email, password } = await readBody(req);

            if (!email || !password) {
                return send(res, 400, {
                    success: false,
                    message: "Email and password are required."
                });
            }

            const users = readJSON(usersFile);

            const user = users.find(item =>
                item.email.toLowerCase() === email.toLowerCase()
            );

            if (!user) {
                return send(res, 404, {
                    success: false,
                    message: "Account not found."
                });
            }

            const hashedPassword = crypto.scryptSync(
                password,
                user.salt,
                64
            ).toString("hex");

            const passwordMatches = crypto.timingSafeEqual(
                Buffer.from(hashedPassword, "hex"),
                Buffer.from(user.password, "hex")
            );

            if (!passwordMatches) {
                return send(res, 401, {
                    success: false,
                    message: "Incorrect password."
                });
            }

            return send(res, 200, {
                success: true,
                message: "Login successful!",
                name: user.name
            });
        }

        // ADMIN STATISTICS
        if (route === "/api/admin/stats" && req.method === "GET") {

            const users = readJSON(usersFile);

            return send(res, 200, {
                students: users.length
            });
        }

        // RESOURCES, GROUPS AND LOST ITEMS
        const collection = routes[route];

        if (collection) {

            const data = readJSON(dataFile);

            if (req.method === "GET") {
                return send(res, 200, data[collection]);
            }

            if (req.method === "POST") {

                const item = await readBody(req);

                if (
                    !item ||
                    typeof item !== "object" ||
                    Array.isArray(item)
                ) {
                    return send(res, 400, {
                        message: "Invalid data."
                    });
                }

                data[collection].push({
                    ...item,
                    id: crypto.randomUUID()
                });

                writeJSON(dataFile, data);

                return send(res, 201, {
                    message: "Data saved successfully!"
                });
            }

            return send(res, 405, {
                message: "Method not allowed."
            });
        }

        // UNKNOWN ROUTE
        return send(res, 404, {
            message: "Route not found."
        });

    } catch (error) {

        console.error("Backend error:", error);

        if (!res.headersSent) {
            return send(res, 500, {
                message: "Internal server error."
            });
        }
    }
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("CampusConnect running on port " + PORT);
});