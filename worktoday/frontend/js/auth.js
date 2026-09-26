/* =========================================================
   WORKTODAY - AUTH.JS
   REAL SUPABASE AUTHENTICATION
========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------
       SUPABASE CHECK
    ----------------------------------------- */

    function getClient() {
        if (!window.supabaseClient) {
            console.error(
                "WorkToday: Supabase client not found."
            );
            return null;
        }

        return window.supabaseClient;
    }

    /* -----------------------------------------
       GET CURRENT USER
    ----------------------------------------- */

    async function getCurrentUser() {

        const supabase = getClient();

        if (!supabase) return null;

        try {

            const {
                data,
                error
            } = await supabase.auth.getUser();

            if (error) {
                console.error(
                    "User check error:",
                    error
                );

                return null;
            }

            return data?.user || null;

        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );

            return null;
        }
    }

    /* -----------------------------------------
       LOGIN
    ----------------------------------------- */

    async function loginUser(email, password) {

        const supabase = getClient();

        if (!supabase) {
            return {
                success: false,
                message: "Supabase connection failed."
            };
        }

        if (!email || !password) {
            return {
                success: false,
                message: "Please enter email and password."
            };
        }

        try {

            const {
                data,
                error
            } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                return {
                    success: false,
                    message: error.message
                };
            }

            if (!data?.user) {
                return {
                    success: false,
                    message: "Login failed."
                };
            }

            return {
                success: true,
                user: data.user
            };

        } catch (error) {

            console.error(error);

            return {
                success: false,
                message: "Something went wrong during login."
            };
        }
    }

    /* -----------------------------------------
       SIGNUP
    ----------------------------------------- */

    async function signupUser({
        name,
        email,
        phone,
        city,
        role,
        password
    }) {

        const supabase = getClient();

        if (!supabase) {
            return {
                success: false,
                message: "Supabase connection failed."
            };
        }

        if (
            !name ||
            !email ||
            !phone ||
            !city ||
            !password
        ) {
            return {
                success: false,
                message: "Please fill all required fields."
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                message:
                    "Password must contain at least 6 characters."
            };
        }

        try {

            const {
                data,
                error
            } = await supabase.auth.signUp({

                email: email.trim(),

                password: password,

                options: {
                    data: {
                        name: name.trim(),
                        phone: phone.trim(),
                        city: city.trim(),
                        role: role || "customer"
                    }
                }

            });

            if (error) {

                return {
                    success: false,
                    message: error.message
                };
            }

            return {
                success: true,
                user: data?.user || null
            };

        } catch (error) {

            console.error(error);

            return {
                success: false,
                message: "Account creation failed."
            };
        }
    }

    /* -----------------------------------------
       LOGOUT
    ----------------------------------------- */

    async function logoutUser() {

        const supabase = getClient();

        if (!supabase) {
            window.location.href = "login.html";
            return;
        }

        try {

            await supabase.auth.signOut();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

        window.location.href = "login.html";
    }

    /* -----------------------------------------
       PROTECT PRIVATE PAGE
    ----------------------------------------- */

    async function requireLogin() {

        const user = await getCurrentUser();

        if (!user) {

            /*
             * Save the page user tried to open.
             * After login we can return there.
             */

            const currentPage =
                window.location.pathname.split("/").pop();

            if (
                currentPage &&
                currentPage !== "login.html" &&
                currentPage !== "signup.html" &&
                currentPage !== "index.html"
            ) {

                sessionStorage.setItem(
                    "worktoday_redirect",
                    currentPage
                );
            }

            window.location.replace("login.html");

            return null;
        }

        return user;
    }

    /* -----------------------------------------
       REDIRECT AFTER LOGIN
    ----------------------------------------- */

    function redirectAfterLogin() {

        const savedPage =
            sessionStorage.getItem(
                "worktoday_redirect"
            );

        if (savedPage) {

            sessionStorage.removeItem(
                "worktoday_redirect"
            );

            window.location.replace(
                savedPage
            );

            return;
        }

        window.location.replace(
            "customer-dashboard.html"
        );
    }

    /* -----------------------------------------
       LOGIN FORM AUTO CONNECTION
    ----------------------------------------- */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const loginForm =
                document.getElementById(
                    "loginForm"
                );

            if (!loginForm) return;

            loginForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

                    const emailInput =
                        document.getElementById(
                            "email"
                        );

                    const passwordInput =
                        document.getElementById(
                            "password"
                        );

                    const email =
                        emailInput
                            ? emailInput.value.trim()
                            : "";

                    const password =
                        passwordInput
                            ? passwordInput.value
                            : "";

                    const result =
                        await loginUser(
                            email,
                            password
                        );

                    if (!result.success) {

                        alert(
                            result.message
                        );

                        return;
                    }

                    redirectAfterLogin();

                }
            );

        }
    );

    /* -----------------------------------------
       PUBLIC AUTH FUNCTIONS
    ----------------------------------------- */

    window.WorkTodayAuth = {

        getCurrentUser:
            getCurrentUser,

        loginUser:
            loginUser,

        signupUser:
            signupUser,

        logoutUser:
            logoutUser,

        requireLogin:
            requireLogin,

        redirectAfterLogin:
            redirectAfterLogin

    };

})();