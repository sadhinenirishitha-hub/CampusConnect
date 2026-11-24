const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = 5000;

const db = path.join(__dirname, "users.json");
const dataFile = path.join(__dirname, "data.json");

if (!fs.existsSync(db)) {
    fs.writeFileSync(db, "[]");
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({
        resources: [],
        groups: [],
        lostItems: []
    }, null, 2));
}

const server = http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // Homepage
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            message: "CampusConnect Backend Working!"
        }));
    }

    // Registration
    if (req.url === "/api/register" && req.method === "POST") {

        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            try {
                const { name, email, usn, department, password } =
                    JSON.parse(body);

                if (!name || !email || !usn || !department || !password) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({
                        message: "All fields are required."
                    }));
                }

                if (password.length < 8) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({
                        message: "Password must be at least 8 characters."
                    }));
                }

                const users = JSON.parse(fs.readFileSync(db, "utf8"));

                if (users.some(u =>
                    u.email.toLowerCase() === email.toLowerCase()
                )) {
                    res.writeHead(409);
                    return res.end(JSON.stringify({
                        message: "Email already registered."
                    }));
                }

                const salt = crypto.randomBytes(16).toString("hex");

                const hashedPassword = crypto.scryptSync(
                    password, salt, 64
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

                fs.writeFileSync(db, JSON.stringify(users, null, 2));

                res.writeHead(201);
                res.end(JSON.stringify({
                    message: "Registration successful!"
                }));

            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    message: "Invalid registration data."
                }));
            }
        });

        return;
    }

    // Login
    if (req.url === "/api/login" && req.method === "POST") {

        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            try {
                const { email, password } = JSON.parse(body);

                if (!email || !password) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({
                        success: false,
                        message: "Email and password are required."
                    }));
                }

                const users = JSON.parse(fs.readFileSync(db, "utf8"));

                const user = users.find(u =>
                    u.email.toLowerCase() === email.toLowerCase()
                );

                if (!user) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({
                        success: false,
                        message: "Account not found."
                    }));
                }

                const hashedPassword = crypto.scryptSync(
                    password, user.salt, 64
                ).toString("hex");

                if (hashedPassword !== user.password) {
                    res.writeHead(401);
                    return res.end(JSON.stringify({
                        success: false,
                        message: "Incorrect password."
                    }));
                }

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    message: "Login successful!",
                    name: user.name
                }));

            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    success: false,
                    message: "Invalid login data."
                }));
            }
        });

        return;
    }

    // Admin statistics - prototype only
    if (req.url === "/api/admin/stats" && req.method === "GET") {

        const users = JSON.parse(fs.readFileSync(db, "utf8"));

        res.writeHead(200);
        return res.end(JSON.stringify({
            students: users.length
        }));
    }

    // Shared resources, groups and lost-and-found
    const dataRoutes = {
        "/api/resources": "resources",
        "/api/groups": "groups",
        "/api/lost-items": "lostItems"
    };

    const collection = dataRoutes[req.url];

    if (collection) {

        const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

        if (req.method === "GET") {
            res.writeHead(200);
            return res.end(JSON.stringify(data[collection]));
        }

        if (req.method === "POST") {

            let body = "";

            req.on("data", chunk => body += chunk);

            req.on("end", () => {
                try {
                    const item = JSON.parse(body);

                    if (!item || typeof item !== "object" ||
                        Array.isArray(item)) {
                        res.writeHead(400);
                        return res.end(JSON.stringify({
                            message: "Invalid data."
                        }));
                    }

                    data[collection].push({
                        ...item,
                        id: crypto.randomUUID()
                    });

                    fs.writeFileSync(
                        dataFile,
                        JSON.stringify(data, null, 2)
                    );

                    res.writeHead(201);
                    res.end(JSON.stringify({
                        message: "Data saved successfully!"
                    }));

                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        message: "Invalid request data."
                    }));
                }
            });

            return;
        }

        res.writeHead(405);
        return res.end(JSON.stringify({
            message: "Method not allowed."
        }));
    }

    // Unknown routes
    res.writeHead(404);
    res.end(JSON.stringify({
        message: "Route not found"
    }));

});

server.listen(PORT, () => {
    console.log(`CampusConnect running on port ${PORT}`);
});