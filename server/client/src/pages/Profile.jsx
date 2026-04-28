import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Settings from "./Settings";
import Logout from "./Logout";
import Tabs from "./Tabs";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");

    if (section === "email") {
      setShowChangeEmailModal(true);
    }

    if (section === "password") {
      setShowChangePasswordModal(true);
    }
  }, [location.search]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("********");
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [showChangeBirthdayModal, setShowChangeBirthdayModal] = useState(false);
  const [newBirthdate, setNewBirthdate] = useState("");
  const [birthdateError, setBirthdateError] = useState("");
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [toast, setToast] = useState("");
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("TOKEN:", token);

        const res = await fetch("https://achievo-59su.onrender.com/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Profile fetch failed:", res.status, text);
          return;
        }

        const data = await res.json();
        console.log("PROFILE RESPONSE:", data);

        setName(data.name || "");
        setEmail(data.email || "");
        setBirthdate(data.birthdate ? data.birthdate.split("T")[0] : "");
        setPassword(data.password || "********");

        if (data.profile_image) {
          setProfileImage(
            data.profile_image
              ? `https://achievo-59su.onrender.com${data.profile_image}`
              : "/default-profile.png",
          );
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("Max file size is 500k.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://achievo-59su.onrender.com/profile/photo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setProfileImage(`https://achievo-59su.onrender.com${data.profile_image}`);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      if (newName.trim() === name) {
        setNameError("There's nothing to change.");
        return;
      }
      setNameError("Please enter a new name.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://achievo-59su.onrender.com/profile/name",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newName.trim(),
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Update name failed:", res.status, text);
        throw new Error("Failed to update name");
      }

      const data = await res.json();

      setName(data.name);
      setNewName("");
      setNameError("");
      setShowChangeNameModal(false);
      showToast("Name updated successfully");
    } catch (err) {
      setNameError(err.message || "Failed to update name");
    }
  };
  const handleSaveBirthday = async () => {
    if (!newBirthdate) {
      if (newBirthdate === birthdate) {
        setBirthdateError("There's nothing to change.");
        return;
      }
      setBirthdateError("Please enter a new birthday.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://achievo-59su.onrender.com/profile/birthday",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            birthdate: newBirthdate,
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Update birthday failed:", res.status, text);
        throw new Error("Failed to update birthday");
      }

      const data = await res.json();

      setBirthdate(data.birthdate ? data.birthdate.split("T")[0] : "");
      setNewBirthdate("");
      setBirthdateError("");
      setShowChangeBirthdayModal(false);
      showToast("Birthday updated successfully");
    } catch (err) {
      setBirthdateError(err.message || "Failed to update birthday");
    }
  };

  const handleSaveEmail = async () => {
    if (!newEmail.trim()) {
      setEmailError("Please enter a new email.");
      return;
    }

    if (newEmail.trim() === email) {
      setEmailError("There's nothing to change.");
      return;
    }

    if (!emailPassword) {
      setEmailError("Please enter your password.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://achievo-59su.onrender.com/profile/email",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: newEmail.trim(),
            password: emailPassword,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update email");
      }

      setEmail(data.email);
      setNewEmail("");
      setEmailPassword("");
      setEmailError("");
      setShowChangeEmailModal(false);
      showToast("Email updated successfully");
    } catch (err) {
      setEmailError(err.message || "Failed to update email");
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword && !newPassword && !confirmPassword) {
      setPasswordError("Please enter all required fields.");
      return;
    }

    if (!currentPassword) {
      setPasswordError("Enter current password.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Enter a new password.");
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Please re-enter new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Password didn't match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://achievo-59su.onrender.com/profile/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setShowChangePasswordModal(false);
      showToast("Password updated successfully");
    } catch (err) {
      setPasswordError(err.message || "Failed to update password");
    }
  };

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };
  return (
    <div className="h-screen w-screen flex bg-[#f7f4ef] p-[18px] gap-[14px] font-[DM_Sans] text-[#1f1a14] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Corben:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');

        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #f7f4ef;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      {showChangeNameModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
          <div className="w-[420px] rounded-[22px] border border-[#ece5db] bg-white px-[24px] py-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <div className="mb-[18px] flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-bold text-[#1f1a14]">
                Change name
              </h2>

              <button
                type="button"
                onClick={() => setShowChangeNameModal(false)}
                className="border-none bg-transparent text-[22px] leading-none text-[#4a433c]"
              >
                ×
              </button>
            </div>

            <label className="mb-[8px] block text-[13px] font-medium text-[#2f2a23]">
              Enter new name
            </label>

            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNameError("");
              }}
              className="h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
            />

            {nameError && (
              <div className="mt-[10px] text-[12px] font-medium text-[#c0392b]">
                {nameError}
              </div>
            )}

            <div className="mt-[20px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setShowChangeNameModal(false)}
                className="rounded-full border border-[#8d8478] bg-white px-[16px] py-[8px] text-[12px] font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveName}
                disabled={!newName.trim() || newName.trim() === name}
                className={`rounded-full border px-[18px] py-[8px] text-[12px] font-bold ${
                  !newName.trim() || newName.trim() === name
                    ? "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-[#2f281e] bg-[#a8d6e6]"
                }`}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangeBirthdayModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
          <div className="w-[420px] rounded-[22px] border border-[#ece5db] bg-white px-[24px] py-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <div className="mb-[18px] flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-bold text-[#1f1a14]">
                Change Birthday
              </h2>

              <button
                type="button"
                onClick={() => setShowChangeBirthdayModal(false)}
                className="border-none bg-transparent text-[22px] leading-none text-[#4a433c]"
              >
                ×
              </button>
            </div>

            <label className="mb-[8px] block text-[13px] font-medium text-[#2f2a23]">
              Enter new birthday
            </label>

            <input
              type="date"
              value={newBirthdate}
              onChange={(e) => {
                setNewBirthdate(e.target.value);
                setBirthdateError("");
              }}
              className="h-[42px] w-full cursor-pointer rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
            />

            {birthdateError && (
              <div className="mt-[10px] text-[12px] font-medium text-[#c0392b]">
                {birthdateError}
              </div>
            )}

            <div className="mt-[20px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setShowChangeBirthdayModal(false)}
                className="rounded-full border border-[#8d8478] bg-white px-[16px] py-[8px] text-[12px] font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveBirthday}
                disabled={!newBirthdate || newBirthdate === birthdate}
                className={`rounded-full border px-[18px] py-[8px] text-[12px] font-bold ${
                  !newBirthdate || newBirthdate === birthdate
                    ? "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-[#2f281e] bg-[#a8d6e6]"
                }`}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangeEmailModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
          <div className="w-[420px] rounded-[22px] border border-[#ece5db] bg-white px-[24px] py-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <div className="mb-[18px] flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-bold text-[#1f1a14]">
                Change Email
              </h2>

              <button
                type="button"
                onClick={() => setShowChangeEmailModal(false)}
                className="border-none bg-transparent text-[22px] leading-none text-[#4a433c]"
              >
                ×
              </button>
            </div>

            <label className="mb-[8px] block text-[13px] font-medium text-[#2f2a23]">
              Email
            </label>

            <input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailError("");
              }}
              className="mb-[14px] h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
            />

            <label className="mb-[8px] block text-[13px] font-medium text-[#2f2a23]">
              Password
            </label>

            <input
              type="password"
              value={emailPassword}
              onChange={(e) => {
                setEmailPassword(e.target.value);
                setEmailError("");
              }}
              className="h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
            />

            {emailError && (
              <div className="mt-[10px] text-[12px] font-medium text-[#c0392b]">
                {emailError}
              </div>
            )}

            <div className="mt-[20px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setShowChangeEmailModal(false)}
                className="rounded-full border border-[#8d8478] bg-white px-[16px] py-[8px] text-[12px] font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEmail}
                className="rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[8px] text-[12px] font-bold"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
          <div className="w-[420px] rounded-[22px] border border-[#ece5db] bg-white px-[24px] py-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <div className="mb-[18px] flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-bold text-[#1f1a14]">
                Change Password
              </h2>

              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="border-none bg-transparent text-[22px] leading-none text-[#4a433c]"
              >
                ×
              </button>
            </div>

            <label className="mb-[8px] block text-[13px] font-medium text-[#2f2a23]">
              Enter current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError("");
              }}
              className="mb-[14px] h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
            />

            <label className="mb-[8px] block text-[13px] font-medium text-[#2f2a23]">
              Enter new password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              className="mb-[14px] h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
            />

            <label className="mb-[8px] block text-[13px] font-medium text-[#2f2a23]">
              Re-enter new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError("");
              }}
              className="h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
            />

            {passwordError && (
              <div className="mt-[10px] text-[12px] font-medium text-[#c0392b]">
                {passwordError}
              </div>
            )}

            <div className="mt-[20px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="rounded-full border border-[#8d8478] bg-white px-[16px] py-[8px] text-[12px] font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className={`rounded-full border px-[18px] py-[8px] text-[12px] font-bold ${
                  !currentPassword || !newPassword || !confirmPassword
                    ? "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-[#2f281e] bg-[#a8d6e6]"
                }`}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
      {showSettingsModal && (
        <Settings onClose={() => setShowSettingsModal(false)} />
      )}

      {showLogoutModal && (
        <Logout
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      )}
      <Tabs
        activeTab="profile"
        setActiveTab={(tab) => {
          if (tab === "dashboard") navigate("/dashboard");
          if (tab === "tasks")
            navigate("/dashboard", { state: { activeTab: "tasks" } });
          if (tab === "notifications")
            navigate("/dashboard", { state: { activeTab: "notifications" } });
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenLogout={() => setShowLogoutModal(true)}
        userName={name}
      />

      <main className="flex-1 h-full flex flex-col gap-[14px] overflow-hidden min-w-0">
        <div className="flex justify-between items-center gap-[12px] px-[16px] py-[10px] bg-white rounded-full border border-[#e8e3dc] shadow-sm">
          <input
            type="text"
            placeholder="Search"
            className="w-[300px] bg-[#f0ede8] rounded-full px-[20px] py-[8px] text-[14px] text-[#5b544c] outline-none"
          />

          <div className="flex items-center gap-[16px]">
            <button className="flex h-[35px] w-[35px] items-center justify-center rounded-full border-2 border-[#2d261d] overflow-hidden">
              <img
                src={profileImage}
                alt="profile"
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        </div>

        <section className="flex-1 bg-white rounded-[26px] border border-[#ede7dd] overflow-hidden">
          <div className="px-[32px] py-[28px] border-b border-[#ece5db]">
            <h1 className="text-[28px] font-bold m-0">Profile</h1>
          </div>

          <div className="grid grid-cols-[180px_1fr] border-b border-[#ece5db]">
            <div className="px-[32px] py-[26px] text-[16px] font-bold">
              Profile photo
            </div>

            <div className="px-[28px] py-[22px] flex items-center gap-[30px] mb-[40px]">
              {" "}
              <img
                src={profileImage}
                alt="Profile"
                className="h-[140px] w-[140px] rounded-[22px] object-cover"
              />
              <div className="flex flex-col gap-[14px]">
                <label className="w-max cursor-pointer rounded-full border border-[#2f281e] bg-white px-[18px] py-[9px] text-[13px] font-bold">
                  ＋ Upload photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                </label>

                <div className="text-[13px] leading-[1.35] text-[#2f2a23]">
                  Supported formats: jpg, gif or png.
                  <br />
                  Max file size: 500k.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr_220px] border-b border-[#ece5db]">
            <div className="px-[32px] py-[26px] text-[16px] font-bold">
              Personal Details
            </div>

            <div className="px-[28px] py-[24px] flex gap-[28px]">
              <div>
                <label className="block mb-[12px] text-[13px]">Name*</label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="h-[38px] w-[280px] rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[13px] text-[#2d261d] outline-none disabled:cursor-not-allowed disabled:opacity-100"
                />
              </div>

              <div>
                <label className="block mb-[12px] text-[13px]">Birthday*</label>
                <input
                  type="date"
                  value={birthdate}
                  disabled
                  className="h-[38px] w-[180px] rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[13px] text-[#2d261d] outline-none disabled:cursor-not-allowed disabled:opacity-100"
                />
              </div>
            </div>

            <div className="px-[28px] py-[24px] flex flex-col items-end gap-[10px]">
              <button
                type="button"
                onClick={() => {
                  setNewName(name);
                  setNameError("");
                  setShowChangeNameModal(true);
                }}
                className="rounded-full border border-[#2f281e] bg-white px-[14px] py-[7px] text-[12px] font-bold"
              >
                Change Name
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewBirthdate(birthdate);
                  setBirthdateError("");
                  setShowChangeBirthdayModal(true);
                }}
                className="rounded-full border border-[#2f281e] bg-white px-[14px] py-[7px] text-[12px] font-bold"
              >
                Change Birthday
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[180px_1fr_220px]">
            {" "}
            <div className="px-[32px] py-[26px] text-[16px] font-bold">
              Account Details
            </div>
            <div className="px-[28px] py-[24px] flex gap-[28px]">
              <div>
                <label className="block mb-[12px] text-[13px]">
                  Email address
                </label>
                <div className="h-[38px] w-[280px] rounded-[10px] bg-[#F5F5FA] px-[14px] flex items-center text-[13px] text-[#2d261d] underline">
                  {email}
                </div>
              </div>

              <div>
                <label className="block mb-[12px] text-[13px]">Password</label>
                <div className="h-[38px] w-[280px] rounded-[10px] bg-[#F5F5FA] px-[14px] flex items-center text-[13px] text-[#2d261d] overflow-hidden text-ellipsis whitespace-nowrap">
                  {"•".repeat(8)}{" "}
                </div>
              </div>
            </div>
            <div className="px-[28px] py-[24px] flex flex-col items-end gap-[10px]">
              <button
                type="button"
                onClick={() => {
                  setNewEmail(email);
                  setEmailPassword("");
                  setEmailError("");
                  setShowChangeEmailModal(true);
                }}
                className="rounded-full border border-[#2f281e] bg-white px-[14px] py-[7px] text-[12px] font-bold"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                  setShowChangePasswordModal(true);
                }}
                className="rounded-full border border-[#2f281e] bg-white px-[14px] py-[7px] text-[12px] font-bold"
              >
                Change Password
              </button>
            </div>
          </div>
        </section>
      </main>
      {toast && (
        <div className="fixed bottom-[30px] right-[30px] z-[2000]">
          <div className="rounded-[12px] bg-[#2f281e] px-[18px] py-[12px] text-white text-[13px] shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
