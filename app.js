const sampleRate = 50; // Sample rate in Hz
const windowSize = 100; // Number of samples to display in the time series

let accelData = [];
let timeData = Array.from({ length: windowSize }, (_, i) => i / sampleRate - windowSize / sampleRate);
let isMeasuring = false;
let intervalId;

// Initialize Chart.js charts
const ctxTimeSeries = document.getElementById('timeSeriesChart').getContext('2d');
const ctxFFT = document.getElementById('fftChart').getContext('2d');

const timeSeriesChart = new Chart(ctxTimeSeries, {
    type: 'line',
    data: {
        labels: timeData,
        datasets: [{
            label: 'Acceleration Z-axis',
            data: Array(windowSize).fill(0),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (s)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Acceleration (m/s^2)'
                },
                min: -10,
                max: 10
            }
        }
    }
});

const fftChart = new Chart(ctxFFT, {
    type: 'line',
    data: {
        labels: [], // Will be set dynamically
        datasets: [{
            label: 'FFT',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Frequency (Hz)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Amplitude'
                },
                min: 0
            }
        }
    }
});

document.getElementById('startButton').addEventListener('click', startMeasurement);
document.getElementById('stopButton').addEventListener('click', stopMeasurement);
document.getElementById('downloadButton').addEventListener('click', downloadData);
document.getElementById('emailButton').addEventListener('click', emailData);

function startMeasurement() {
    isMeasuring = true;
    accelData = [];
    intervalId = setInterval(() => {
        if (isMeasuring) {
            const newAccel = readAccelerationZ();
            if (accelData.length >= windowSize) {
                accelData.shift();
            }
            accelData.push(newAccel);
            updateTimeSeriesChart();
        }
    }, 1000 / sampleRate);
}

function stopMeasurement() {
    isMeasuring = false;
    clearInterval(intervalId);
    updateFFTChart();
}

function readAccelerationZ() {
    // Replace with actual sensor data reading code
    return Math.random() * 20 - 10;
}

function updateTimeSeriesChart() {
    timeSeriesChart.data.datasets[0].data = accelData;
    timeSeriesChart.update();
}

function updateFFTChart() {
    const fftData = calculateFFT(accelData);
    const frequencies = Array.from({ length: fftData.length }, (_, i) => i * sampleRate / windowSize);
    fftChart.data.labels = frequencies;
    fftChart.data.datasets[0].data = fftData;
    fftChart.update();
}

function calculateFFT(data) {
    const n = data.length;
    const fft = new FFT(n);
    const out = fft.createComplexArray();
    fft.realTransform(out, data);
    fft.completeSpectrum(out);
    return out.slice(0, n / 2).map(c => Math.sqrt(c[0] * c[0] + c[1] * c[1]));
}

function downloadData() {
    const blob = new Blob([JSON.stringify(accelData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acceleration_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function emailData() {
    const data = JSON.stringify(accelData);
    const email = prompt('Enter email address:');
    if (email) {
        axios.post('/send-email', { email, data })
            .then(response => alert('Email sent successfully'))
            .catch(error => alert('Error sending email'));
    }
}

// Placeholder for the FFT implementation (if not using an external library)
class FFT {
    constructor(size) {
        this.size = size;
        // Initialize other necessary properties here...
    }

    createComplexArray() {
        return new Array(this.size).fill([0, 0]);
    }

    realTransform(out, data) {
        // Implement the real FFT transform...
    }

    completeSpectrum(out) {
        // Implement the spectrum completion...
    }
}
