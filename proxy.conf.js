const PROXY_CONFIG = [
    {
        context: [
            "/Auth",
            "/Dropdown",
            "/EmergencyRegister",
            "/Health",
            "/Caller",
            "/Patient",
            "/Login",
            "/Location"
        ],
        target: "https://streettreat.appspot.com/",
        changeOrigin: "true",
        secure: true
    }
]

module.exports = PROXY_CONFIG;