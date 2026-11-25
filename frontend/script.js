// =====================================
// 1. HOMEPAGE
// =====================================

function explore() {
    const features = document.querySelector(".features");

    if (features) {
        features.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =====================================
// 2. STUDENT REGISTRATION
// =====================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const student = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            usn: document.getElementById("usn").value,
            department: document.getElementById("department").value,
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch(
                "https://campus-connect-oea4.onrender.com/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                }
            );

            const result = await response.json();

            document.getElementById("message").textContent =
                result.message;

            if (response.ok) {
                registerForm.reset();
            }

        } catch (error) {
            document.getElementById("message").textContent =
                "Unable to connect to server.";
        }
    });
}


// =====================================
// 3. STUDENT LOGIN
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const credentials = {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        };

        try {
            const response = await fetch(
                "https://campus-connect-oea4.onrender.com",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(credentials)
                }
            );

            const result = await response.json();

            document.getElementById("loginMessage").textContent =
                result.message;

            if (result.success) {
                sessionStorage.setItem("studentName", result.name);
                window.location.href = "dashboard.html";
            }

        } catch (error) {
            document.getElementById("loginMessage").textContent =
                "Unable to connect to server.";
        }
    });
}


// =====================================
// 4. STUDENT DASHBOARD
// =====================================

const studentName = document.getElementById("studentName");

if (studentName) {
    studentName.textContent =
        sessionStorage.getItem("studentName") || "Student";
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}


// =====================================
// 5. CAMPUS EVENTS
// =====================================

function registerEvent(eventName) {

    let events = JSON.parse(
        localStorage.getItem("registeredEvents") || "[]"
    );

    if (events.includes(eventName)) {
        document.getElementById("eventMessage").textContent =
            "You have already shown interest in this event.";
        return;
    }

    events.push(eventName);

    localStorage.setItem(
        "registeredEvents",
        JSON.stringify(events)
    );

    document.getElementById("eventMessage").textContent =
        "Successfully registered interest in " + eventName + "!";
}


// =====================================
// 6. STUDY RESOURCES
// =====================================

const resourceForm = document.getElementById("resourceForm");

async function displayResources() {

    const list = document.getElementById("resourceList");

    if (!list) return;

    try {
        const response = await fetch(
            "https://campus-connect-oea4.onrender.com",
        );

        const resources = await response.json();

        list.innerHTML = "";

        resources.forEach(resource => {

            const card = document.createElement("div");
            card.className = "dashboard-card";

            const title = document.createElement("h3");
            title.textContent = resource.title;

            const subject = document.createElement("p");
            subject.textContent = resource.subject;

            const link = document.createElement("a");
            link.href = resource.link;
            link.textContent = "Open Resource";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            card.append(title, subject, link);
            list.appendChild(card);
        });

    } catch (error) {
        list.textContent = "Unable to load resources.";
    }
}

if (resourceForm) {

    resourceForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const resource = {
            title: document.getElementById("resourceTitle").value,
            subject: document.getElementById("resourceSubject").value,
            link: document.getElementById("resourceLink").value
        };

        try {
            const response = await fetch(
                "https://campus-connect-oea4.onrender.com",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(resource)
                }
            );

            const result = await response.json();

            document.getElementById("resourceMessage").textContent =
                result.message;

            if (response.ok) {
                resourceForm.reset();
                displayResources();
            }

        } catch (error) {
            document.getElementById("resourceMessage").textContent =
                "Unable to connect to server.";
        }
    });

    displayResources();
}


// =====================================
// 7. STUDY GROUPS
// =====================================

const groupForm = document.getElementById("groupForm");

async function displayGroups() {

    const list = document.getElementById("groupList");

    if (!list) return;

    try {
        const response = await fetch(
            "https://campus-connect-oea4.onrender.com"
        );

        const groups = await response.json();

        list.innerHTML = "";

        groups.forEach(group => {

            const card = document.createElement("div");
            card.className = "dashboard-card";

            const title = document.createElement("h3");
            title.textContent = group.name;

            const subject = document.createElement("p");
            subject.textContent = "Subject: " + group.subject;

            card.append(title, subject);
            list.appendChild(card);
        });

    } catch (error) {
        list.textContent = "Unable to load study groups.";
    }
}

if (groupForm) {

    groupForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const group = {
            name: document.getElementById("groupName").value,
            subject: document.getElementById("groupSubject").value
        };

        try {
            const response = await fetch(
                "https://campus-connect-oea4.onrender.com",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(group)
                }
            );

            const result = await response.json();

            document.getElementById("groupMessage").textContent =
                result.message;

            if (response.ok) {
                groupForm.reset();
                displayGroups();
            }

        } catch (error) {
            document.getElementById("groupMessage").textContent =
                "Unable to connect to server.";
        }
    });

    displayGroups();
}


// =====================================
// 8. LOST AND FOUND
// =====================================

const lostForm = document.getElementById("lostForm");

async function displayLostItems() {

    const list = document.getElementById("lostList");

    if (!list) return;

    try {
        const response = await fetch(
            "https://campus-connect-oea4.onrender.com"
        );

        const items = await response.json();

        list.innerHTML = "";

        items.forEach(item => {

            const card = document.createElement("div");
            card.className = "dashboard-card";

            const title = document.createElement("h3");
            title.textContent = item.name;

            const status = document.createElement("p");
            status.textContent = "Status: " + item.status;

            const location = document.createElement("p");
            location.textContent = "Location: " + item.location;

            const description = document.createElement("p");
            description.textContent = item.description;

            card.append(title, status, location, description);
            list.appendChild(card);
        });

    } catch (error) {
        list.textContent = "Unable to load reports.";
    }
}

if (lostForm) {

    lostForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const item = {
            name: document.getElementById("itemName").value,
            status: document.getElementById("itemStatus").value,
            location: document.getElementById("itemLocation").value,
            description: document.getElementById("itemDescription").value
        };

        try {
            const response = await fetch(
                "https://campus-connect-oea4.onrender.com",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(item)
                }
            );

            const result = await response.json();

            document.getElementById("lostMessage").textContent =
                result.message;

            if (response.ok) {
                lostForm.reset();
                displayLostItems();
            }

        } catch (error) {
            document.getElementById("lostMessage").textContent =
                "Unable to connect to server.";
        }
    });

    displayLostItems();
}


// =====================================
// 9. ADMIN DASHBOARD
// =====================================

async function loadAdminStats() {

    try {
        const [usersResponse, resourcesResponse,
            groupsResponse, itemsResponse] = await Promise.all([

            fetch("https://campus-connect-oea4.onrender.com"),
            fetch("https://campus-connect-oea4.onrender.com"),
            fetch("https://campus-connect-oea4.onrender.com"),
            fetch("https://campus-connect-oea4.onrender.com")

        ]);

        if (!usersResponse.ok || !resourcesResponse.ok ||
            !groupsResponse.ok || !itemsResponse.ok) {
            throw new Error("Unable to load statistics");
        }

        const users = await usersResponse.json();
        const resources = await resourcesResponse.json();
        const groups = await groupsResponse.json();
        const items = await itemsResponse.json();

        document.getElementById("studentCount").textContent =
            users.students;

        document.getElementById("resourceCount").textContent =
            resources.length;

        document.getElementById("groupCount").textContent =
            groups.length;

        document.getElementById("lostCount").textContent =
            items.length;

    } catch (error) {
        console.log("Admin statistics could not be loaded.");
    }
}

if (document.getElementById("studentCount")) {
    loadAdminStats();
}