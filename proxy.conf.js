const PROXY_CONFIG = [
    {
        context: [
            "/Auth",
            "/Caller",
            "/DriverView",
            "/Dropdown",
            "/EmergencyRegister",
            "/EventEmitter",
            "/Health",
            "/Location",
            "/Login",
            "/Logs",
            "/Logo",
            "/Media",
            "/Messaging",
            "/Organisation",
            "/Patient",
            "/PrintTemplate",
            "/ReleaseDetails",
            "/Reporting",
            "/RescueDetails",
            "/StreetTreat",
            "/SurgeryRegister",
            "/Teams",
            "/Treatment",
            "/TreatmentList",
            "/Users",
            "/UserAdmin",
            "/Vehicle"
        ],
        target: "http://localhost:8080/",
        changeOrigin: "true",
        secure: true
    }
]

module.exports = PROXY_CONFIG;
