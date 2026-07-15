export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isHR = () => getRole() === "HR";
export const isEmployee = () => getRole() === "EMPLOYEE";