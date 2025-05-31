const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyCPtEP4OhWnFF7HaZheMNLE2WJKRlHPPwvQqgqYVz8dDf52WTVOOeAuBk5BTaPsYC6vg/exec'; // From Step 2
const slotSelect = document.getElementById('slotSelect');
const bookingForm = document.getElementById('bookingForm');
const loadingIndicator = document.getElementById('loading');
const messageDiv = document.getElementById('message');

async function fetchAvailableSlots() {
    loadingIndicator.style.display = 'block';
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getSlots`);
        const slots = await response.json();

        slotSelect.innerHTML = ''; // Clear existing options
        if (slots.length > 0) {
            slots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.SlotID;
                option.textContent = `${slot.InterviewerName} - ${slot.Date} at ${slot.Time} (${slot.Duration})`;
                slotSelect.appendChild(option);
            });
            slotSelect.disabled = false;
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No available slots at the moment.';
            slotSelect.appendChild(option);
            slotSelect.disabled = true;
        }
    } catch (error) {
        console.error('Error fetching slots:', error);
        showMessage('Failed to load slots. Please try again later.', 'error');
        slotSelect.innerHTML = '<option value="">Error loading slots</option>';
        slotSelect.disabled = true;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const studentName = document.getElementById('studentName').value;
    const studentEmail = document.getElementById('studentEmail').value;
    const selectedSlotId = slotSelect.value;

    if (!selectedSlotId) {
        showMessage('Please select an interview slot.', 'error');
        return;
    }

    // Disable form during submission
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Booking...';

    try {
        const response = await fetch(`${WEB_APP_URL}?action=bookSlot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Apps Script expects text/plain for raw JSON
            },
            body: JSON.stringify({
                slotId: selectedSlotId,
                studentName: studentName,
                studentEmail: studentEmail
            })
        });
        const result = await response.json();

        if (result.success) {
            showMessage(result.message, 'success');
            bookingForm.reset(); // Clear the form
            fetchAvailableSlots(); // Refresh slots
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Error booking slot:', error);
        showMessage('An error occurred during booking. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Book Now';
    }
});

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`; // Add success or error class
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000); // Hide after 5 seconds
}


// Initial load
fetchAvailableSlots();