import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const login = (user, role) => {
    // Format user details nicely if they are missing fields
    const formattedUser = {
      id: user.id,
      name: user.name || user.candidateName || user.username || "User",
      email: user.email,
      role: role || user.role || "EMPLOYEE",
      employeeId: user.employeeId || (role === "HR" ? `EMP-HR-${user.id}` : `EMP-${1000 + user.id}`),
      department: user.department?.departmentName || user.department || (role === "HR" ? "Human Resources" : "IT"),
      companyName: user.companyName || "",
      mobileNumber: user.mobileNumber || user.mobile || "",
    };
    
    const loginTime = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    localStorage.setItem("currentUser", JSON.stringify(formattedUser));
    localStorage.setItem("role", role);
    localStorage.setItem("lastLoginTime", loginTime);
    setCurrentUser(formattedUser);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    localStorage.removeItem("lastLoginTime");
    setCurrentUser(null);
  };

  const updateCurrentUser = (updatedUser) => {
    const formattedUser = {
      ...currentUser,
      ...updatedUser,
    };
    localStorage.setItem("currentUser", JSON.stringify(formattedUser));
    setCurrentUser(formattedUser);
  };

  const lastLoginTime = localStorage.getItem("lastLoginTime") || new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userName: currentUser?.name || "",
        employeeId: currentUser?.employeeId || "",
        email: currentUser?.email || "",
        role: currentUser?.role || "",
        department: currentUser?.department || "",
        lastLoginTime,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
