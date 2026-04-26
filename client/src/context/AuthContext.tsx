import { createContext, useContext, useEffect, useState } from "react";
import type { AxiosError } from "axios";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import toast from "react-hot-toast";

type LoginPayload = {
   email: string;
   password: string;
};

type SignUpPayload = {
   name: string;
   email: string;
   password: string;
};

type ApiErrorResponse = {
   message?: string;
};

interface AuthContextProps {
   isLoggedIn: boolean;
   setIsLoggedIn: (isLoggedIn: boolean) => void;
   user: IUser | null;
   setUser: (user: IUser | null) => void;
   login: (user: LoginPayload) => Promise<void>;
   signUp: (user: SignUpPayload) => Promise<void>;
   logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextProps>({
   isLoggedIn: false,
   setIsLoggedIn: () => {},
   user: null,
   setUser: () => {},
   login: async () => {},
   signUp: async () => {},
   logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [user, setUser] = useState<IUser | null>(null);
   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

   const getErrorMessage = (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return axiosError.response?.data?.message || "Something went wrong";
   };

   const signUp = async ({ name, email, password }: SignUpPayload) => {
      try {
         const { data } = await api.post("/api/auth/register", {
            name,
            email,
            password,
         });

         if (data.user) {
            setUser(data.user as IUser);
            setIsLoggedIn(true);
         }

         toast.success(data.message);
      } catch (error) {
         toast.error(getErrorMessage(error));
      }
   };

   const login = async ({ email, password }: LoginPayload) => {
      try {
         const { data } = await api.post("/api/auth/login", { email, password });
         if (data.user) {
            setUser(data.user as IUser);
            setIsLoggedIn(true);
         }
         toast.success(data.message);
      } catch (error) {
         toast.error(getErrorMessage(error));
      }
   };

   const fetchUser = async () => {
      try {
         const { data } = await api.get("/api/auth/verify");
         if (data.user) {
            setUser(data.user as IUser);
            setIsLoggedIn(true);
         } else {
            setUser(null);
            setIsLoggedIn(false);
         }
      } catch (error) {
         setUser(null);
         setIsLoggedIn(false);
      }
   };

   const logout = async () => {
      try {
         const { data } = await api.post("/api/auth/logout");
         setUser(null);
         setIsLoggedIn(false);
         toast.success(data.message);
      } catch (error) {
         toast.error(getErrorMessage(error));
      }
   };

   useEffect(() => {
      (async () => {
         await fetchUser();
      })();
   }, []);

   const value = {
      user,
      setUser,
      isLoggedIn,
      setIsLoggedIn,
      login,
      signUp,
      logout,
   };

   return (
      <AuthContext.Provider value={value}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => useContext(AuthContext);
