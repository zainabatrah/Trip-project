import {
  useMemo,
  useState,
} from "react";

import PublicPageLayout from "../components/PublicPageLayout.jsx";
import { pageTheme } from "../components/publicPageTheme.js";

import {
  createPrivateTripRequest,
} from "../api/privateTripRequests.js";

const initialForm = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  durationValue: "",
  durationUnit: "days",
  transportation: "Car",
  travelers: "",
  budget: "",
  notes: "",
};

const privateTripHighlights = [
  {
    title: "Custom Route",
    desc: "Describe the exact destination or area you want the organizer to plan.",
  },
  {
    title: "Flexible Group Size",
    desc: "Set travelers, dates, and transportation in the same request.",
  },
  {
    title: "Direct Review",
    desc: "The organizer reviews the request and answers inside your requests page.",
  },
];

export default function PrivateTrip() {
  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  const validationError =
    useMemo(() => {
      if (
        form.title.trim().length <
        3
      ) {
        return "Trip title must contain at least 3 characters.";
      }

      if (
        form.destination
          .trim()
          .length < 2
      ) {
        return "Destination is required.";
      }

      if (
        !form.startDate ||
        !form.endDate
      ) {
        return "Start date and end date are required.";
      }

      if (
        form.endDate <
        form.startDate
      ) {
        return "End date cannot be before the start date.";
      }

      const durationValue =
        Number(
          form.durationValue
        );

      if (
        !Number.isInteger(
          durationValue
        ) ||
        durationValue < 1
      ) {
        return "Duration must be a positive whole number.";
      }

      if (
        ![
          "days",
          "hours",
        ].includes(
          form.durationUnit
        )
      ) {
        return "Duration unit must be days or hours.";
      }

      const travelers =
        Number(
          form.travelers
        );

      if (
        !Number.isInteger(
          travelers
        ) ||
        travelers < 1
      ) {
        return "Travelers must be a positive whole number.";
      }

      const budget =
        Number(
          form.budget
        );

      if (
        !Number.isFinite(
          budget
        ) ||
        budget < 0
      ) {
        return "Budget must be a non-negative number.";
      }

      if (
        form.notes.length >
        800
      ) {
        return "Notes cannot exceed 800 characters.";
      }

      return "";
    }, [form]);

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    try {
      setSaving(true);

      const data =
        await createPrivateTripRequest(
          {
            title:
              form.title.trim(),

            destination:
              form.destination.trim(),

            startDate:
              form.startDate,

            endDate:
              form.endDate,

            duration: {
              value:
                Number(
                  form.durationValue
                ),

              unit:
                form.durationUnit,
            },

            transportation:
              form.transportation,

            travelers:
              Number(
                form.travelers
              ),

            budget:
              Number(
                form.budget
              ),

            notes:
              form.notes.trim(),
          }
        );

      setSuccess(
        data.message ||
          "Private trip request sent successfully."
      );

      setForm(
        initialForm
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
          "Could not send the private trip request."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicPageLayout
      eyebrow="Private Trips"
      title="Create Private Trip"
      subtitle="Submit your requirements for the organizer to review."
      maxWidth={920}
      headerAction={
        <div
          style={
            styles.headerCard
          }
        >
          <strong
            style={
              styles.headerValue
            }
          >
            1 Request
          </strong>

          <span
            style={
              styles.headerText
            }
          >
            includes route, dates, travelers, and budget
          </span>
        </div>
      }
    >
      <div
        style={
          styles.highlightsGrid
        }
      >
        {privateTripHighlights.map(
          (item) => (
            <div
              key={
                item.title
              }
              style={
                pageTheme.tile
              }
            >
              <div
                style={
                  pageTheme.iconCircle
                }
              >
                ✦
              </div>

              <h2
                style={
                  styles.highlightTitle
                }
              >
                {item.title}
              </h2>

              <p
                style={
                  styles.highlightText
                }
              >
                {item.desc}
              </p>
            </div>
          )
        )}
      </div>

      <section
        style={
          pageTheme.surface
        }
      >
        <div
          style={
            styles.sectionIntro
          }
        >
          <h2
            style={
              pageTheme.sectionTitle
            }
          >
            Request details
          </h2>

          <p
            style={
              styles.sectionText
            }
          >
            Add the destination, preferred dates, transport choice, and anything the organizer should know before responding.
          </p>
        </div>

        {error && (
          <div
            style={
              pageTheme.errorBox
            }
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={
              pageTheme.successBox
            }
          >
            {success}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div
            style={
              styles.grid
            }
          >
            <Field
              label="Trip title"
              name="title"
              value={
                form.title
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
            />

            <Field
              label="Destination"
              name="destination"
              value={
                form.destination
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
            />

            <Field
              label="Start date"
              name="startDate"
              type="date"
              value={
                form.startDate
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
            />

            <Field
              label="End date"
              name="endDate"
              type="date"
              min={
                form.startDate
              }
              value={
                form.endDate
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
            />

            <Field
              label="Duration"
              name="durationValue"
              type="number"
              min="1"
              step="1"
              placeholder="Enter duration"
              value={
                form.durationValue
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
            />

            <label
              style={
                pageTheme.field
              }
            >
              <span>
                Duration unit
              </span>

              <select
                name="durationUnit"
                value={
                  form.durationUnit
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
                style={
                  pageTheme.control
                }
              >
                <option
                  value="days"
                >
                  Days
                </option>

                <option
                  value="hours"
                >
                  Hours
                </option>
              </select>
            </label>

            <label
              style={
                pageTheme.field
              }
            >
              <span>
                Transportation
              </span>

              <select
                name="transportation"
                value={
                  form.transportation
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
                style={
                  pageTheme.control
                }
              >
                <option
                  value="Car"
                >
                  Car
                </option>

                <option
                  value="Van"
                >
                  Van
                </option>

                <option
                  value="Minibus"
                >
                  Minibus
                </option>

                <option
                  value="Bus"
                >
                  Bus
                </option>
              </select>
            </label>

            <Field
              label="Travelers"
              name="travelers"
              type="number"
              min="1"
              step="1"
              value={
                form.travelers
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
            />

            <Field
              label="Budget"
              name="budget"
              type="number"
              min="0"
              step="0.01"
              value={
                form.budget
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
            />
          </div>

          <div
            style={
              pageTheme.divider
            }
          />

          <div
            style={
              styles.notesGrid
            }
          >
            <label
              style={
                pageTheme.field
              }
            >
              <span>
                Notes
              </span>

              <textarea
                name="notes"
                value={
                  form.notes
                }
                onChange={
                  handleChange
                }
                maxLength={
                  800
                }
                disabled={
                  saving
                }
                placeholder="Optional details such as preferred stops, food requests, hotel ideas, or schedule notes."
                style={{
                  ...pageTheme.control,
                  ...pageTheme.textarea,
                }}
              />

              <span
                style={
                  styles.noteCounter
                }
              >
                {
                  form.notes.length
                }
                /800
              </span>
            </label>

            <aside
              style={
                pageTheme.softSurface
              }
            >
              <h3
                style={
                  pageTheme.smallTitle
                }
              >
                Helpful details
              </h3>

              <p
                style={
                  styles.helperText
                }
              >
                Requests are easier to review when you include travel style, pickup city, timing preferences, and any must-have stops.
              </p>

              <div
                style={
                  styles.helperList
                }
              >
                <span
                  style={
                    pageTheme.pill
                  }
                >
                  Pickup city
                </span>

                <span
                  style={
                    pageTheme.pill
                  }
                >
                  Budget range
                </span>

                <span
                  style={
                    pageTheme.pill
                  }
                >
                  Group needs
                </span>

                <span
                  style={
                    pageTheme.pill
                  }
                >
                  Special stops
                </span>
              </div>
            </aside>
          </div>

          <button
            type="submit"
            disabled={
              saving
            }
            style={{
              ...pageTheme.buttonPrimary,

              width:
                "100%",

              opacity:
                saving
                  ? 0.7
                  : 1,

              cursor:
                saving
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {saving
              ? "Sending..."
              : "Send Request"}
          </button>
        </form>
      </section>
    </PublicPageLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
  ...props
}) {
  return (
    <label
      style={
        pageTheme.field
      }
    >
      <span>
        {label}
      </span>

      <input
        {...props}
        name={
          name
        }
        type={
          type
        }
        value={
          value
        }
        onChange={
          onChange
        }
        disabled={
          disabled
        }
        style={
          pageTheme.control
        }
      />
    </label>
  );
}

const styles = {
  headerCard: {
    minWidth: 200,
    padding: "18px 20px",
    borderRadius: 18,
    background:
      "rgba(255, 255, 255, 0.72)",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 12px 30px rgba(96, 165, 250, 0.18)",
    display: "grid",
    gap: 4,
  },

  headerValue: {
    fontSize: 24,
    color: "#1e3a8a",
  },

  headerText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.5,
  },

  highlightsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 18,
  },

  highlightTitle: {
    margin: "0 0 8px",
    fontSize: 18,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  highlightText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },

  sectionIntro: {
    marginBottom: 8,
  },

  sectionText: {
    margin: "0 0 18px",
    color: "#475569",
    lineHeight: 1.7,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },

  notesGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 18,
    alignItems: "start",
  },

  noteCounter: {
    justifySelf: "end",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
  },

  helperText: {
    margin: "0 0 14px",
    color: "#475569",
    lineHeight: 1.7,
  },

  helperList: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
};