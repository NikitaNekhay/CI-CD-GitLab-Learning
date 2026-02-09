// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// Fetch currency rates
fetch('https://www.cbr-xml-daily.ru/daily_json.js')
    .then(response => response.json())
    .then(data => {
        const usd = data.Valute.USD.Value.toFixed(2);
        const eur = data.Valute.EUR.Value.toFixed(2);
        document.getElementById('currency-data').innerHTML = `USD: ${usd} RUB<br>EUR: ${eur} RUB`;
    })
    .catch(() => {
        document.getElementById('currency-data').innerHTML = 'Error loading currency data.';
    });

// Fetch weather (auto by IP, fallback to Moscow)
fetch('https://wttr.in?format=j1')
    .then(response => response.json())
    .then(data => {
        const temp = data.current_condition[0].temp_C;
        const desc = data.current_condition[0].weatherDesc[0].value;
        const location = data.nearest_area[0].areaName[0].value;
        document.getElementById('weather-data').innerHTML = `Location: ${location}<br>Temperature: ${temp}°C<br>Condition: ${desc}`;
    })
    .catch(() => {
        // Fallback to Moscow
        fetch('https://wttr.in/Moscow?format=j1')
            .then(response => response.json())
            .then(data => {
                const temp = data.current_condition[0].temp_C;
                const desc = data.current_condition[0].weatherDesc[0].value;
                document.getElementById('weather-data').innerHTML = `Moscow (fallback)<br>Temperature: ${temp}°C<br>Condition: ${desc}`;
            })
            .catch(() => {
                document.getElementById('weather-data').innerHTML = 'Error loading weather data.';
            });
    });

// Fetch RIA RSS
fetch('https://ria.ru/export/rss2/index.xml')
    .then(response => response.text())
    .then(str => new DOMParser().parseFromString(str, 'text/xml'))
    .then(data => {
        const items = data.querySelectorAll('item');
        const list = document.getElementById('news-list');
        Array.from(items).slice(0, 5).forEach(item => {
            const title = item.querySelector('title').textContent;
            const link = item.querySelector('link').textContent;
            const li = document.createElement('li');
            li.innerHTML = `<a href="${link}" target="_blank">${title}</a>`;
            list.appendChild(li);
        });
    })
    .catch(() => {
        document.getElementById('news-list').innerHTML = '<li>Error loading news.</li>';
    });

// Dots animation
const canvas = document.getElementById('dots-canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let particles = [];

function createParticles(x, y) {
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: x,
            y: y,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 - 2,
            radius: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            alpha: 1
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.01;
        if (p.alpha <= 0) {
            particles.splice(i, 1);
            return;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}`;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    createParticles(e.clientX - rect.left, e.clientY - rect.top);
});

animate();