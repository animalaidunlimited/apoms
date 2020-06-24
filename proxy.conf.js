const PROXY_CONFIG = [
    {
        context: [
            "/Auth",
            "/Dropdown",
            "/EmergencyRegister",
            "/RescueDetails",
            "/Health",
            "/Caller",
            "/Patient",
            "/Login",
            "/Location",
<<<<<<< HEAD
            "/Messaging"
=======
            "/EventEmitter",
            "/SurgeryRegister"
>>>>>>> 52215419447ebc087dbdfe49fec58856bfa4d47b
        ],
        target: "http://localhost:8080/",
        changeOrigin: "true",
        secure: true
    }
]

module.exports = PROXY_CONFIG;