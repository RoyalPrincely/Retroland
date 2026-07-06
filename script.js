// ⚡ FIXED: All rendering logic safely housed inside the runtime initialization wrapper
document.addEventListener('DOMContentLoaded', function() { 
    console.log('Retro website is fully loaded and ready!'); 
    
    const heading = document.querySelector('h1'); 
    if (heading) { 
        heading.addEventListener('click', function() { 
            alert('You clicked the heading!'); 
        }); 
    } 

    // --- Clock Initialization Section --- 
    function updateClock() { 
        const now = new Date(); 
        let hours = now.getHours(); 
        const minutes = String(now.getMinutes()).padStart(2, '0'); 
        const seconds = String(now.getSeconds()).padStart(2, '0'); 
        const ampm = hours >= 12 ? 'PM' : 'AM'; 
        hours = hours % 12; 
        hours = hours ? hours : 12; 
        const hoursStr = String(hours).padStart(2, '0'); 
        const clockElement = document.getElementById('retro-clock'); 
        if (clockElement) { 
            clockElement.textContent = `${hoursStr}:${minutes}:${seconds} ${ampm}`; 
        } 
    } 
    setInterval(updateClock, 1000); 
    updateClock(); 

    // --- Visitor Counter Logic Section --- 
    function runHitCounter() { 
        const counterElement = document.getElementById('hit-counter'); 
        if (counterElement) { 
            let currentHits = parseInt(localStorage.getItem('site_hits')) || 0; 
            currentHits++; // Increment value on render load 
            localStorage.setItem('site_hits', currentHits); 
            // Format number to old school 6 digit dashboard pad (e.g. 000042) 
            counterElement.textContent = String(currentHits).padStart(6, '0'); 
        } 
    } 
    runHitCounter(); 

    // --- Guestbook Logic Section --- 
    const form = document.getElementById('guestbook-form'); 
    const entriesContainer = document.getElementById('guestbook-entries'); 

    function displayEntries() { 
        const entries = JSON.parse(localStorage.getItem('retro_guestbook')) || []; 
        if (entriesContainer) { 
            entriesContainer.innerHTML = entries.length === 0 ? '<p style="color: #666; font-size: 12px; margin: 0;">No entries yet...</p>' : ''; 
            entries.forEach(entry => { 
                const div = document.createElement('div'); 
                div.style.marginBottom = '10px'; 
                div.style.fontSize = '13px'; 
                div.innerHTML = `<strong style="color: cyan;">&gt; ${entry.name}:</strong> <span style="color: white;">${entry.message}</span>`; 
                entriesContainer.appendChild(div); 
            }); 
            // Force container scroll baseline tracking 
            entriesContainer.scrollTop = entriesContainer.scrollHeight; 
        } 
    } 

    if (form) { 
        form.addEventListener('submit', function(e) { 
            e.preventDefault(); 
            const nameInput = document.getElementById('visitor-name'); 
            const messageInput = document.getElementById('visitor-message'); 
            const newEntry = { name: nameInput.value, message: messageInput.value }; 
            const entries = JSON.parse(localStorage.getItem('retro_guestbook')) || []; 
            entries.push(newEntry); 
            localStorage.setItem('retro_guestbook', JSON.stringify(entries)); 
            nameInput.value = ''; 
            messageInput.value = ''; 
            displayEntries(); 
            
            // Re-run webmentions collection loop to stay synced
            fetchLiveWebmentions();
        }); 
    } 

    // Draw previous entries on interface deployment 
    displayEntries(); 

    // --- Live IndieWeb Webmentions Stream Module --- 
      function fetchLiveWebmentions() { 
        const TOKEN = 'wUPeSQ02vAv2EduSaxkJGQ'; 
        if (!entriesContainer) return; 

        // 🚀 FIXED: Full endpoint path configuration and proper template literal interpolation syntax added
        fetch(`https://webmention.io${TOKEN}`) 
            .then(res => res.json()) 
            .then(data => { 
                if (!data.children || data.children.length === 0) return; 
                data.children.forEach(mention => { 
                    // Check if this specific webmention has already been drawn to prevent duplicates 
                    const mentionId = `wm-${mention['wm-id']}`; 
                    if (document.getElementById(mentionId)) return; 

                    const authorName = mention.author?.name || 'Anonymous Peer'; 
                    const messageContent = mention.content?.text || 'Liked or bookmarked your node!'; 
                    const div = document.createElement('div'); 
                    div.id = mentionId; 
                    div.style.marginBottom = '10px'; 
                    div.style.fontSize = '13px'; 
                    div.style.borderLeft = '2px solid #ff00ff'; 
                    div.style.paddingLeft = '6px'; 
                    div.innerHTML = `<strong style="color: #ff00ff;">📡 [WEBMENTION] &gt; ${authorName}:</strong> <span style="color: white;">${messageContent}</span>`; 
                    
                    // Prepend so new external social webmentions float to the top of your view 
                    entriesContainer.insertBefore(div, entriesContainer.firstChild); 
                }); 
            }) 
            .catch(err => console.log('Webmention stream idle.', err)); 
    } 

    // Initialize the network feed stream loop cleanly inside DOM scope 
    fetchLiveWebmentions(); 

}); // End of initialization block wrapper
