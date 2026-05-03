const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/ws`;
let ws;

const ekranLobby = document.getElementById('lobby');
const ekranKontrolera = document.getElementById('kontroler');
const nickInput = document.getElementById('nick');
const btnGraj = document.getElementById('btn-graj');

let obecnyStan = { x: 128, y: 128, a: 0, b: 0 };
let wyslanyStan = { x: 128, y: 128, a: 0, b: 0 };
let petlaWysylania;

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
        alert("Rozłączono z serwerem gier!");
        clearInterval(petlaWysylania);
        location.reload();
    };
}

function uruchomInterfejsGry() {
    const joystickZone = document.getElementById('joystick-zone');
    const manager = nipplejs.create({
        zone: joystickZone,
        mode: 'static',
        position: { left: '30%', top: '50%' },
        color: 'white',
        size: 150
    });

    manager.on('move', (evt, data) => {
        const dystans = data.distance; 
        const maxDystansNipple = manager.options.size / 2;
        const katRadiany = data.angle.radian;
        
        const rawX = Math.cos(katRadiany) * (dystans / maxDystansNipple) * 127;
        const rawY = Math.sin(katRadiany) * (dystans / maxDystansNipple) * 127;

        obecnyStan.x = Math.round(128 + rawX);
        obecnyStan.y = Math.round(128 - rawY); 
    });

    manager.on('end', () => {
        obecnyStan.x = 128;
        obecnyStan.y = 128;
    });

    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');

    const przypiszGuzik = (element, kluczStanu) => {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            obecnyStan[kluczStanu] = 1;
            element.style.opacity = '0.5';
        });
        element.addEventListener('touchend', (e) => {
            e.preventDefault(); 
            obecnyStan[kluczStanu] = 0;
            element.style.opacity = '1';
        });
    };

    przypiszGuzik(btnA, 'a');
    przypiszGuzik(btnB, 'b');

    petlaWysylania = setInterval(() => {
        let pakietZmian = {};
        let czyCokolwiekSieZmienilo = false;

        for (let os_lub_guzik in obecnyStan) {
            if (obecnyStan[os_lub_guzik] !== wyslanyStan[os_lub_guzik]) {
                pakietZmian[os_lub_guzik] = obecnyStan[os_lub_guzik];
                wyslanyStan[os_lub_guzik] = obecnyStan[os_lub_guzik];
                czyCokolwiekSieZmienilo = true;
            }
        }

        if (czyCokolwiekSieZmienilo && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ akcja: "STAN", stan: pakietZmian }));
        }
    }, 1000 / 30); 
}
