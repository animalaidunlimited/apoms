const PROXY_CONFIG = [
    {
        context: [
            "/Auth",
            "/Case",
            "/EmergencyRegister",
            "/Health",
            "/Caller",
            "/Patient"
        ],
        target: "http://localhost:8080",
        changeOrigin: "true",
        secure: false
    }
]

module.exports = PROXY_CONFIG;