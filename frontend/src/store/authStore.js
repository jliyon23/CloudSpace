import { create } from "zustand";

const useAuthStore = create((set) => ({
    token: localStorage.getItem("token") || null,
    isVerified: JSON.parse(localStorage.getItem("isVerified")) || false,
    user: JSON.parse(localStorage.getItem("user")) || null,

    login: (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isVerified", JSON.stringify(userData.isVerified));
        
        set({ token, user: userData, isVerified: userData.isVerified });
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isVerified");

        set({ token: null, user: null, isVerified: false });
    },

    verifyEmail: () => {
        set({ isVerified: true });
        localStorage.setItem("isVerified", JSON.stringify(true));
    }
}));

export default useAuthStore;
