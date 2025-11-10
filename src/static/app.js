document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to show a temporary message
  function showMessage(text, type = "success") {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");
    setTimeout(() => messageDiv.classList.add("hidden"), 5000);
  }
 
  // Function to fetch activities from API and render them
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and activity select (keep default option)
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const title = document.createElement("h4");
        title.textContent = name;

        const desc = document.createElement("p");
        desc.textContent = details.description;

        const schedule = document.createElement("p");
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const spotsLeft = details.max_participants - details.participants.length;
        const availability = document.createElement("p");
        availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(schedule);
        activityCard.appendChild(availability);

        // Participants
        if (details.participants.length > 0) {
          const participantsDiv = document.createElement("div");
          participantsDiv.className = "participants";
          const pHeader = document.createElement("h5");
          pHeader.textContent = "Current Participants:";
          const ul = document.createElement("ul");

          details.participants.forEach(email => {
            const li = document.createElement("li");
            const spanEmail = document.createElement("span");
            spanEmail.textContent = email;

            const del = document.createElement("span");
            del.className = "delete-participant";
            del.title = "Remove participant";
            del.textContent = "×";
            del.addEventListener("click", () => unregisterParticipant(name, email));

            li.appendChild(spanEmail);
            li.appendChild(del);
            ul.appendChild(li);
          });

          participantsDiv.appendChild(pHeader);
          participantsDiv.appendChild(ul);
          activityCard.appendChild(participantsDiv);
        } else {
          const noPart = document.createElement("p");
          noPart.innerHTML = "<em>No participants yet</em>";
          activityCard.appendChild(noPart);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message || "Signed up successfully", "success");
        signupForm.reset();
        // Refresh activities to show the newly registered participant
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Function to unregister a participant
  window.unregisterParticipant = async (activity, email) => {
    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message || "Successfully unregistered from activity", "success");
        // Refresh the activities list
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister. Please try again.", "error");
      console.error("Error unregistering:", error);
    }
  };

  // Initialize app
  fetchActivities();
});
