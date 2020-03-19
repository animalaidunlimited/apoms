const PROXY_CONFIG = [
    {
        context: [
            "/Auth",
            "/Dropdown",
            "/EmergencyRegister",
            "/Health",
            "/Caller",
            "/Patient",
            "/Login"
        ],
        target: "http://localhost:8080",
        changeOrigin: "true",
        secure: false
    }
]

module.exports = PROXY_CONFIG;