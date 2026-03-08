document.addEventListener('DOMContentLoaded', () => {
    const powerBtn = document.getElementById('powerBtn');
    const statusTxt = document.getElementById('statusTxt');
    const timeEl = document.getElementById('time');
    const batteryPercent = document.getElementById('batteryPercent');
    const batteryLevel = document.getElementById('batteryLevel');
    const tempVal = document.getElementById('tempVal');
    
    let isLightOn = false;
    let track = null;

    // Update Time
    function updateTime() {
        const now = new Date();
        timeEl.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Battery Status
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const updateBattery = () => {
                const level = Math.round(battery.level * 100);
                batteryPercent.textContent = level + '%';
                batteryLevel.style.width = level + '%';
                batteryLevel.style.background = level < 20 ? '#ff5252' : '#4caf50';
            };
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
        });
    }

    // Flashlight Toggle
    async function toggleFlashlight() {
        try {
            if (!isLightOn) {
                // Turn ON
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                const videoTrack = stream.getVideoTracks()[0];
                const capabilities = videoTrack.getCapabilities();

                if (capabilities.torch) {
                    await videoTrack.applyConstraints({
                        advanced: [{ torch: true }]
                    });
                    track = videoTrack;
                    isLightOn = true;
                    document.body.classList.add('light-on');
                    statusTxt.textContent = 'SYSTEM ACTIVE';
                    
                    // Vibrate
                    if (navigator.vibrate) navigator.vibrate(50);
                } else {
                    alert('Hardware torch not supported on this device/browser.');
                }
            } else {
                // Turn OFF
                if (track) {
                    await track.applyConstraints({
                        advanced: [{ torch: false }]
                    });
                    track.stop();
                }
                isLightOn = false;
                document.body.classList.remove('light-on');
                statusTxt.textContent = 'TAP TO TURN ON';
                
                // Vibrate
                if (navigator.vibrate) navigator.vibrate([30, 30]);
            }
        } catch (err) {
            console.error('Flashlight Error:', err);
            // Fallback for desktop testing (mocking)
            isLightOn = !isLightOn;
            document.body.classList.toggle('light-on', isLightOn);
            statusTxt.textContent = isLightOn ? 'MOCK SYSTEM ACTIVE' : 'TAP TO TURN ON';
        }
    }

    powerBtn.addEventListener('click', toggleFlashlight);

    // Initial Random Temp
    tempVal.textContent = (Math.floor(Math.random() * 5) + 22) + '°C';
});
