const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/ws`;
let ws;

const ekranLobby = document.getElementById('lobby');
const ekranKontrolera = document.getElementById('kontroler');
const nickInput = document.getElementById('nick');
const btnGraj = document.getElementById('btn-graj');

// 128 oznacza pozycję neutralną (środek)
let obecnyStan = { x: 128, y: 128, a: 0, b: 0, start: 0, select: 0 };
let wyslanyStan = { x: 128, y: 128, a: 0, b: 0, start: 0, select: 0 };
let petlaWysylania;

// Pomocniczy obiekt do śledzenia aktywnych kierunków D-Pada
let dpadKierunki = { up: false, down: false, left: false, right: false };

btnGraj.addEventListener('click', () => {
    const nick = nickInput.value.trim() || "Gracz_" + Math.floor(Math.random() * 1000);
    start(nick);
});

function start(nick) {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        ws.send(JSON.stringify({ akcja: "DOLACZ", nick: nick }));
        ekranLobby.style.display = 'none';
        ekranKontrolera.style.display = 'flex';
        uruchomInterfejsGry();
    };

    ws.onclose = () => {
        alert("Rozłączono z serwerem!");
        clearInterval(petlaWysylania);
        location.reload();
    };
}

function uruchomInterfejsGry() {
    // Funkcja mapująca stan przycisków kierunkowych na wartości osi evdev (0, 128, 255)
    function aktualizujOsieDpad() {
        if (dpadKierunki.left) obecnyStan.x = 0;
        else if (dpadKierunki.right) obecnyStan.x = 255;
        else obecnyStan.x = 128;

        if (dpadKierunki.up) obecnyStan.y = 0;
        else if (dpadKierunki.down) obecnyStan.y = 255;
        else obecnyStan.y = 128;
    }

    // Obsługa fizycznego dotyku dla przycisków D-Pada
    const konfigurujDpad = (idElementu, kluczKierunku) => {
        const el = document.getElementById(idElementu);
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            dpadKierunki[kluczKierunku] = true;
            el.style.backgroundColor = '#34495e';
            aktualizujOsieDpad();
        });
        el.addEventListener('touchend', (e) => {
            e.preventDefault();
            dpadKierunki[kluczKierunku] = false;
            el.style.backgroundColor = '#2c3e50';
            aktualizujOsieDpad();
        });
    };

    konfigurujDpad('dpad-up', 'up');
    konfigurujDpad('dpad-down', 'down');
    konfigurujDpad('dpad-left', 'left');
    konfigurujDpad('dpad-right', 'right');

    // Uniwersalna funkcja dla standardowych przycisków (A, B, START, SELECT)
    const konfigurujPrzycisk = (idElementu, kluczStanu) => {
        const el = document.getElementById(idElementu);
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            obecnyStan[kluczStanu] = 1;
            el.style.opacity = '0.6';
        });
        el.addEventListener('touchend', (e) => {
            e.preventDefault();
            obecnyStan[kluczStanu] = 0;
            el.style.opacity = '1';
        });
    };

    konfigurujPrzycisk('btn-a', 'a');
    konfigurujPrzycisk('btn-b', 'b');
    konfigurujPrzycisk('btn-start', 'start');
    konfigurujPrzycisk('btn-select', 'select');

    // Wysyłanie zmian co ~33ms (30 FPS), tylko jeśli stan się zmienił
    petlaWysylania = setInterval(() => {
        let pakietZmian = {};
        let czyCokolwiekSieZmienilo = false;

        for (let element in obecnyStan) {
            if (obecnyStan[element] !== wyslanyStan[element]) {
                pakietZmian[element] = obecnyStan[element];
                wyslanyStan[element] = obecnyStan[element];
                czyCokolwiekSieZmienilo = true;
            }
        }

        if (czyCokolwiekSieZmienilo && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ akcja: "STAN", stan: pakietZmian }));
        }
    }, 1000 / 30);
}