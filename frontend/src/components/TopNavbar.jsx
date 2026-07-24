import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  FaBell,
  FaCheckCircle,
  FaClipboardList,
  FaCommentDots,
  FaSuitcaseRolling,
  FaUserFriends,
} from "react-icons/fa";
import {
  getAuthenticatedUser,
  getCurrentUser,
  isLoggedIn,
  isOrganizerRole,
  logoutUser,
  subscribeToAuthChanges,
} from "../api/auth.js";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications.js";
import { API_ROOT } from "../api/apiBase.js";
import styles from "../Styles/welcome.module.css";

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(
    () => getCurrentUser()
  );
  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);
  const [
    notifications,
    setNotifications,
  ] = useState([]);
  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);
  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(false);
  const [
    notificationError,
    setNotificationError,
  ] = useState("");
  const notificationRef =
    useRef(null);
  const navigate =
    useNavigate();
  const profileImage = getProfileImage(user);
  const profileLetter = getProfileLetter(user);
  const isOrganizer =
    isOrganizerRole(
      user?.role
    );

  useEffect(
    () =>
      subscribeToAuthChanges(
        setUser
      ),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function syncUser() {
      if (!isLoggedIn()) {
        if (!cancelled) {
          setUser(null);
        }

        return;
      }

      try {
        const data =
          await getAuthenticatedUser();

        if (!cancelled) {
          setUser(
            data?.user || null
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error.status === 401) {
          logoutUser();
          setUser(null);

          return;
        }

        setUser(getCurrentUser());
      }
    }

    syncUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user?._id) {
      return undefined;
    }

    let cancelled = false;
    let intervalId = null;

    async function refreshNotifications(
      silently = false
    ) {
      try {
        if (!silently) {
          setNotificationLoading(
            true
          );
        }

        setNotificationError("");

        const data =
          await getNotifications(10);

        if (cancelled) {
          return;
        }

        setNotifications(
          Array.isArray(
            data?.notifications
          )
            ? data.notifications
            : []
        );
        setUnreadCount(
          Number(
            data?.unreadCount || 0
          )
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error?.status === 401) {
          logoutUser();
          setUser(null);

          return;
        }

        setNotificationError(
          error?.message ||
            "Could not load notifications."
        );
      } finally {
        if (
          !cancelled &&
          !silently
        ) {
          setNotificationLoading(
            false
          );
        }
      }
    }

    refreshNotifications();

    intervalId = window.setInterval(
      () => {
        refreshNotifications(
          true
        );
      },
      30000
    );

    return () => {
      cancelled = true;
      window.clearInterval(
        intervalId
      );
    };
  }, [user?._id]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    if (open) {
      document.body.style.overflow =
        "hidden";
    }

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleResize() {
      if (window.innerWidth > 1100) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  useEffect(() => {
    if (!notificationOpen) {
      return undefined;
    }

    function handleClickOutside(
      event
    ) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [notificationOpen]);

  async function handleToggleNotifications() {
    const nextOpen =
      !notificationOpen;

    setNotificationOpen(
      nextOpen
    );

    if (!nextOpen || !user?._id) {
      return;
    }

    try {
      setNotificationLoading(
        true
      );
      setNotificationError("");

      const data =
        await getNotifications(10);

      setNotifications(
        Array.isArray(
          data?.notifications
        )
          ? data.notifications
          : []
      );
      setUnreadCount(
        Number(
          data?.unreadCount || 0
        )
      );
    } catch (error) {
      setNotificationError(
        error?.message ||
          "Could not load notifications."
      );
    } finally {
      setNotificationLoading(
        false
      );
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();

      const now =
        new Date().toISOString();

      setNotifications((current) =>
        current.map(
          (notification) => ({
            ...notification,
            readAt:
              notification.readAt ||
              now,
            isRead: true,
          })
        )
      );
      setUnreadCount(0);
    } catch (error) {
      setNotificationError(
        error?.message ||
          "Could not update notifications."
      );
    }
  }

  async function handleNotificationClick(
    notification
  ) {
    if (!notification?._id) {
      if (notification?.link) {
        setNotificationOpen(
          false
        );
        navigate(
          notification.link
        );
      }

      return;
    }

    try {
      if (!notification.readAt) {
        await markNotificationRead(
          notification._id
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id ===
            notification._id
              ? {
                  ...item,
                  readAt:
                    new Date().toISOString(),
                  isRead: true,
                }
              : item
          )
        );
        setUnreadCount((current) =>
          Math.max(
            current - 1,
            0
          )
        );
      }
    } catch (error) {
      setNotificationError(
        error?.message ||
          "Could not update the notification."
      );
    } finally {
      if (notification.link) {
        setNotificationOpen(
          false
        );
        navigate(
          notification.link
        );
      }
    }
  }

  function handleCloseOverlays() {
    setOpen(false);
    setNotificationOpen(false);
  }

  function handleToggleMenu() {
    setOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        setNotificationOpen(false);
      }

      return nextOpen;
    });
  }

  return (
   <nav className={`${styles.navbar} ${open ? styles.open : ""}`}>
      <div className={styles.navInner}>
       <div className={`${styles.menu} ${open ? styles.open : ""}`}>
  
          <div className={styles.leftLinks}>
            <Link
              to="/"
              className={styles.link}
              onClick={
                handleCloseOverlays
              }
            >
              Home
            </Link>

            <Link
              to="/about"
              className={styles.link}
              onClick={
                handleCloseOverlays
              }
            >
              About Us
            </Link>
              <Link
      to="/private-trip"
      className={styles.link}
      onClick={handleCloseOverlays}
    >
      Private Trip
    </Link>

{user && (
  <>
   <Link
              to="/trips"
              className={styles.link}
              onClick={
                handleCloseOverlays
              }
            >
              Trips
            </Link>
<Link 
    to={isOrganizer ? "/manage-trips" : "/my-trips"} 
    className={styles.link}
    onClick={handleCloseOverlays}
>
    {isOrganizer ? "Manage Trips" : "My Trips"}
</Link>

    {isOrganizer ? (
      <Link
        to="/manage-travelers"
        className={styles.link}
        onClick={handleCloseOverlays}
      >
        Manage Travelers
      </Link>
    ) : null}

    {isOrganizer ? (
      <Link
        to="/approve"
        className={styles.link}
        onClick={handleCloseOverlays}
      >
        Approve
      </Link>
    ) : (
      <Link
        to="/my-requests"
        className={styles.link}
        onClick={handleCloseOverlays}
      >
        My Requests
      </Link>
      
    )}
  </>
)}
    </div>     
<div className={styles.rightlinks}>
    {user ? (
  <>
    <div
      className={styles.notificationWrap}
      ref={notificationRef}
    >
      <button
        type="button"
        className={
          styles.notificationButton
        }
        onClick={
          handleToggleNotifications
        }
      >
        <FaBell />
        <span
          className={
            styles.notificationButtonText
          }
        >
          Notifications
        </span>
        {unreadCount > 0 ? (
          <span
            className={
              styles.notificationBadge
            }
          >
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        ) : null}
      </button>

      {notificationOpen ? (
        <div
          className={
            styles.notificationPanel
          }
        >
          <div
            className={
              styles.notificationHeader
            }
          >
            <div>
              <strong
                className={
                  styles.notificationTitle
                }
              >
                Notifications
              </strong>
              <p
                className={
                  styles.notificationSubtitle
                }
              >
                {unreadCount} unread update
                {unreadCount === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <button
              type="button"
              className={
                styles.notificationAction
              }
              onClick={
                handleMarkAllRead
              }
              disabled={
                unreadCount === 0
              }
            >
              Mark all read
            </button>
          </div>

          {notificationError ? (
            <div
              className={
                styles.notificationError
              }
            >
              {notificationError}
            </div>
          ) : null}

          <div
            className={
              styles.notificationList
            }
          >
            {notificationLoading ? (
              <div
                className={
                  styles.notificationEmpty
                }
              >
                Loading notifications...
              </div>
            ) : notifications.length ===
              0 ? (
              <div
                className={
                  styles.notificationEmpty
                }
              >
                No notifications yet.
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    key={
                      notification._id
                    }
                    type="button"
                    className={`${styles.notificationItem} ${notification.readAt ? styles.notificationRead : styles.notificationUnread}`}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    <span
                      className={
                        styles.notificationIcon
                      }
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </span>

                    <span
                      className={
                        styles.notificationBody
                      }
                    >
                      <span
                        className={
                          styles.notificationItemTitle
                        }
                      >
                        {
                          notification.title
                        }
                      </span>
                      <span
                        className={
                          styles.notificationMessage
                        }
                      >
                        {
                          notification.message
                        }
                      </span>
                      <span
                        className={
                          styles.notificationMeta
                        }
                      >
                        {formatNotificationTime(
                          notification.createdAt
                        )}
                      </span>
                    </span>
                  </button>
                )
              )
            )}
          </div>
        </div>
      ) : null}
    </div>

    <Link
      to="/Profile"
      className={`${styles.profileCircle} ${styles.circles}`}
      onClick={handleCloseOverlays}
    >
      {profileImage ? (
        <img
          src={profileImage}
          alt="User Profile"
          className={styles.profileImage}
        />
      ) : (
        <span className={styles.profileLetter}>
          {profileLetter}
        </span>
      )}
    </Link>

    <button
      className={styles.secondaryBtn}
      onClick={() => {
        setNotifications([]);
        setUnreadCount(0);
        setNotificationOpen(false);
        logoutUser();
        setUser(null);
        window.location.href = "/";
      }}
    >
      Logout
    </button>
  </>
) : (
  <>
    <Link
      to="/login"
      className={styles.primaryBtn}
      onClick={handleCloseOverlays}
    >
      Login
    </Link>

    <Link
      to="/register"
      className={styles.secondaryBtn}
      onClick={handleCloseOverlays}
    >
      Register
    </Link>
  </>
)}
  </div>
      </div>

      {open ? (
        <button
          type="button"
          className={
            styles.mobileBackdrop
          }
          aria-label="Close menu"
          onClick={
            handleCloseOverlays
          }
        />
      ) : null}

     <div 
  className={styles.hamburger}
  onClick={handleToggleMenu}
>
  {open ? "✕" : "☰"}
</div>
      </div>
    </nav>
  );
}

function getProfileImage(user) {
  const image =
    localStorage.getItem("profileImage") ||
    localStorage.getItem("userImage") ||
    localStorage.getItem("avatar") ||
    user?.profileImage ||
    user?.image ||
    user?.avatar ||
    "";

  if (!image) {
    return "";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${API_ROOT}${image.startsWith("/") ? image : `/${image}`}`;
}

function getProfileLetter(user) {
  const storedName =
    typeof window === "undefined"
      ? ""
      : window.sessionStorage.getItem(
          "tripUserName"
        ) ||
        window.localStorage.getItem(
          "tripUserName"
        ) ||
        window.localStorage.getItem(
          "userName"
        ) ||
        "";

  const name =
    user?.name ||
    user?.username ||
    storedName ||
    "User";

  return name.charAt(0).toUpperCase();
}

function getNotificationIcon(type) {
  const normalizedType =
    String(type || "")
      .trim()
      .toLowerCase();

  if (
    normalizedType.includes(
      "friend"
    )
  ) {
    return <FaUserFriends />;
  }

  if (
    normalizedType.includes(
      "booking"
    )
  ) {
    return (
      <FaSuitcaseRolling />
    );
  }

  if (
    normalizedType.includes(
      "message"
    )
  ) {
    return <FaCommentDots />;
  }

  if (
    normalizedType.includes(
      "private-trip"
    )
  ) {
    return <FaClipboardList />;
  }

  return <FaCheckCircle />;
}

function formatNotificationTime(
  value
) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString();
}
